'use strict';
const $ = id => document.getElementById(id);
const state = { config: null, page: 1, request: 0, graph: null, handoffVersion: 0, handoffRequest: null };
let noticeTimer;
function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function notify(message, error = false) {
  clearTimeout(noticeTimer);
  $('notice').textContent = message;
  $('notice').className = error ? 'error' : '';
  $('notice').hidden = false;
  if (!error) noticeTimer = setTimeout(() => { $('notice').hidden = true; }, 5000);
}
async function call(path, options = {}) {
  const response = await fetch(path, { ...options, credentials: 'same-origin', cache: 'no-store',
    headers: { 'X-Memory-Request': 'dashboard', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validation = Array.isArray(data.detail) ? data.detail.map(item => item.loc.slice(1).join('.') + ': ' + item.msg).join('; ') : null;
    const message = data.error || (typeof data.detail === 'string' ? data.detail : validation) || 'Request failed (' + response.status + ')';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}
function run(action) { return Promise.resolve().then(action).catch(error => notify(error.message, true)); }
async function busy(button, action) {
  button.disabled = true;
  try { return await action(); } finally { button.disabled = false; }
}
async function copy(text) { await navigator.clipboard.writeText(text); notify('Copied to clipboard.'); }
function date(value) {
  if (!value) return 'Not yet observed';
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
function empty(target, message) { target.replaceChildren(node('div', message, 'empty')); }
function metadata(target, values) {
  const list = node('dl', undefined, 'metadata');
  for (const [label, value] of values) if (value !== undefined && value !== null) list.append(node('dt', label), node('dd', String(value)));
  target.append(list);
}
function resultText(item) {
  if (typeof item.memory === 'string') return item.memory;
  return item.memory?.memory || item.chunk?.content || (typeof item.chunk === 'string' ? item.chunk : '') || item.content || item.summary || item.title || 'Open to inspect this result';
}
function memoryCard(item, click, search = false) {
  const card = node('button', undefined, 'memory-card');
  card.type = 'button';
  card.append(node('h3', item.title || (search ? resultText(item) : 'Untitled document')));
  card.append(node('p', item.summary || resultText(item)));
  const meta = node('div', undefined, 'card-meta');
  meta.append(node('span', search ? 'Search match' : item.status || 'unknown', 'status'),
    node('span', item.metadata?.source || (item.createdAt ? date(item.createdAt) : 'Personal memory')));
  card.append(meta);
  card.addEventListener('click', () => run(click));
  return card;
}
async function loadMemories(page = 1) {
  const request = ++state.request;
  $('memory-count').textContent = 'Loading documents…';
  const result = await call('/api/memories?page=' + page);
  if (request !== state.request) return;
  const documents = result.documents || result.memories || [];
  state.page = page;
  $('memory-list').replaceChildren(...documents.map(item => memoryCard(item, () => showDocument(item.id))));
  if (!documents.length) empty($('memory-list'), 'No memories yet. Save your first durable memory through a connected agent.');
  const pagination = result.pagination || {};
  const total = pagination.totalItems ?? documents.length;
  $('memory-count').textContent = total + ' source documents';
  $('page-label').textContent = (pagination.totalPages || 1) > 1 ? 'Page ' + page + ' of ' + pagination.totalPages : '';
  $('previous-page').hidden = page <= 1;
  $('next-page').hidden = page >= (pagination.totalPages || 1);
}
async function showDocument(id) {
  $('detail-title').textContent = 'Loading document…';
  $('detail-content').replaceChildren();
  $('detail-dialog').showModal();
  try {
    const document = await call('/api/memories/' + encodeURIComponent(id));
    $('detail-title').textContent = document.title || 'Source document';
    metadata($('detail-content'), [['Status', document.status], ['Created', date(document.createdAt)], ['Document ID', document.id]]);
    $('detail-content').append(node('p', document.content || document.raw || document.summary || 'No source text available.', 'document-body'));
    const memories = document.memories || [];
    if (memories.length) $('detail-content').append(node('h3', memories.length + ' extracted facts'));
    for (const memory of memories) {
      const fact = node('div', memory.memory, 'fact');
      fact.append(node('small', (memory.isLatest === false ? 'Historical' : 'Current') + (memory.isInference ? ' · Inferred' : '') + ' · Version ' + (memory.version || 1)));
      $('detail-content').append(fact);
    }
  } catch (error) { $('detail-title').textContent = 'Could not load document'; $('detail-content').append(node('p', error.message, 'error')); }
}
$('search-form').addEventListener('submit', event => {
  event.preventDefault();
  const query = $('query').value.trim();
  if (!query) return run(() => loadMemories());
  run(() => busy(event.submitter, async () => {
    const request = ++state.request;
    $('memory-count').textContent = 'Searching…';
    const result = await call('/api/search', { method: 'POST', body: JSON.stringify({ query }) });
    if (request !== state.request) return;
    const matches = result.results || [];
    $('memory-count').textContent = matches.length + ' search results';
    $('memory-list').replaceChildren(...matches.map(item => memoryCard(item, async () => {
      const documentId = item.documentId || item.document?.id;
      if (documentId) return showDocument(documentId);
      $('detail-title').textContent = 'Retrieved memory';
      $('detail-content').replaceChildren(node('p', resultText(item), 'document-body'));
      metadata($('detail-content'), [['Memory ID', item.id], ['Score', item.score]]);
      $('detail-dialog').showModal();
    }, true)));
    if (!matches.length) empty($('memory-list'), 'No relevant memories found. Try a more specific query.');
    $('previous-page').hidden = $('next-page').hidden = true;
    $('page-label').textContent = '';
  }));
});
for (const id of ['refresh-memories', 'show-all']) $(id).addEventListener('click', () => run(() => busy($(id), () => loadMemories())));
$('previous-page').addEventListener('click', () => run(() => loadMemories(state.page - 1)));
$('next-page').addEventListener('click', () => run(() => loadMemories(state.page + 1)));

const svgNS = 'http://www.w3.org/2000/svg';
let graphView = { x: 0, y: 0, scale: 1 }, graphBounds = { width: 1200, height: 850 }, pan = null;
function svgNode(tag, attributes) {
  const el = document.createElementNS(svgNS, tag);
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
  return el;
}
function transformGraph() { $('graph-world').setAttribute('transform', 'translate(' + graphView.x + ' ' + graphView.y + ') scale(' + graphView.scale + ')'); }
function fitGraph() {
  const scale = Math.min(1, 1140 / graphBounds.width, 790 / graphBounds.height);
  graphView = { scale, x: (1200 - graphBounds.width * scale) / 2, y: (850 - graphBounds.height * scale) / 2 };
  transformGraph();
}
function showGraphDetail(selected) {
  $('graph-detail').replaceChildren(node('p', selected.kind === 'document' ? 'SOURCE DOCUMENT' : 'MEMORY', 'eyebrow'), node('h2', selected.label));
  const data = selected.data || {};
  metadata($('graph-detail'), [['ID', data.id], ['Version', data.version], ['Current', data.isLatest], ['Inferred', data.isInference], ['Created', data.createdAt ? date(data.createdAt) : null]]);
  if (selected.kind === 'document') {
    const button = node('button', 'Open source', 'secondary');
    button.addEventListener('click', () => run(() => showDocument(data.id)));
    $('graph-detail').append(button);
  } else {
    const sources = state.graph.edges.filter(edge => edge.type === 'contains' && edge.target === selected.id);
    for (const source of sources) {
      const button = node('button', 'Open source document', 'secondary');
      button.addEventListener('click', () => run(() => showDocument(source.source.slice(9))));
      $('graph-detail').append(button);
    }
  }
}
function renderGraph() {
  if (!state.graph) return;
  const query = $('graph-query').value.trim().toLowerCase();
  const latest = $('latest-only').checked;
  let nodes = state.graph.nodes.filter(item => !latest || (item.kind === 'document' || (item.kind === 'memory' && item.data.isLatest !== false && !item.data.isForgotten)));
  if (query) {
    const matched = new Set(nodes.filter(item => (item.label + ' ' + item.id).toLowerCase().includes(query)).map(item => item.id));
    const visible = new Set(matched);
    for (const edge of state.graph.edges) if (matched.has(edge.source) || matched.has(edge.target)) { visible.add(edge.source); visible.add(edge.target); }
    nodes = nodes.filter(item => visible.has(item.id));
  }
  const ids = new Set(nodes.map(item => item.id));
  const edges = state.graph.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target));
  const documents = nodes.filter(item => item.kind === 'document');
  const groups = new Map(documents.map(item => [item.id, []]));
  const owned = new Set();
  for (const edge of edges) if (edge.type === 'contains' && groups.has(edge.source) && !owned.has(edge.target)) { groups.get(edge.source).push(edge.target); owned.add(edge.target); }
  const columns = Math.max(1, Math.ceil(Math.sqrt(documents.length || 1)));
  const positions = new Map();
  let largestGroup = 0;
  for (const children of groups.values()) largestGroup = Math.max(largestGroup, children.length);
  const spacing = Math.max(340, 200 + largestGroup * 11);
  documents.forEach((item, index) => {
    const x = 170 + (index % columns) * spacing, y = 160 + Math.floor(index / columns) * spacing;
    positions.set(item.id, { x, y });
    const children = groups.get(item.id);
    const radius = Math.max(100, Math.min(spacing * .37, children.length * 10));
    children.forEach((id, child) => { const angle = child * Math.PI * 2 / children.length - Math.PI / 2; positions.set(id, { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius }); });
  });
  let extra = 0;
  const extraStart = 160 + Math.ceil(documents.length / columns) * spacing;
  for (const item of nodes) if (!positions.has(item.id)) { positions.set(item.id, { x: 100 + (extra % columns) * spacing, y: extraStart + Math.floor(extra / columns) * 100 }); extra++; }
  graphBounds = { width: Math.max(400, ...[...positions.values()].map(p => p.x + 180)), height: Math.max(300, ...[...positions.values()].map(p => p.y + 90)) };
  const world = $('graph-world');
  world.replaceChildren();
  for (const edge of edges) {
    const a = positions.get(edge.source), b = positions.get(edge.target);
    const line = svgNode('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'graph-edge' + (edge.type === 'previous_version' ? ' version' : '') });
    const title = svgNode('title', {}); title.textContent = edge.type === 'contains' ? 'Source document contains this memory' : 'Memory points to its previous version'; line.append(title); world.append(line);
  }
  for (const item of nodes) {
    const point = positions.get(item.id);
    const group = svgNode('g', { transform: 'translate(' + point.x + ' ' + point.y + ')', class: 'graph-node', tabindex: '0', role: 'button', 'aria-label': item.label });
    const colors = { document: '#406648', memory: '#b0c783', reference: '#b5a9c9' };
    group.append(svgNode('circle', { r: item.kind === 'document' ? 14 : 8, fill: colors[item.kind], stroke: '#fff', 'stroke-width': 2 }));
    const title = svgNode('title', {}); title.textContent = item.label; group.append(title);
    const text = svgNode('text', { x: 0, y: item.kind === 'document' ? 32 : 23, 'text-anchor': 'middle' });
    text.textContent = item.label.length > 34 ? item.label.slice(0, 31) + '…' : item.label; group.append(text);
    const select = () => { world.querySelectorAll('.selected').forEach(el => el.classList.remove('selected')); group.classList.add('selected'); showGraphDetail(item); };
    group.addEventListener('click', event => { event.stopPropagation(); select(); });
    group.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
    world.append(group);
  }
  const graph = state.graph;
  $('graph-status').textContent = nodes.length + ' visible nodes · ' + edges.length + ' connections. ' + graph.coverage +
    (graph.truncated ? ' Showing at most 1,000 source documents.' : '') + (graph.unavailableDocuments ? ' ' + graph.unavailableDocuments + ' document details unavailable.' : '');
  fitGraph();
}
async function loadGraph() {
  $('graph-status').textContent = 'Reading document-linked memories…';
  state.graph = await call('/api/graph'); renderGraph();
}
function graphPoint(event) {
  const point = $('graph-svg').createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
  return point.matrixTransform($('graph-svg').getScreenCTM().inverse());
}
function zoom(factor, point = { x: 600, y: 425 }) {
  const scale = Math.max(.05, Math.min(6, graphView.scale * factor));
  const ratio = scale / graphView.scale;
  graphView.x = point.x - (point.x - graphView.x) * ratio;
  graphView.y = point.y - (point.y - graphView.y) * ratio;
  graphView.scale = scale; transformGraph();
}
$('graph-svg').addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15, graphPoint(event)); }, { passive: false });
$('graph-svg').addEventListener('pointerdown', event => {
  if (event.target.closest('.graph-node')) return;
  const point = graphPoint(event); pan = { x: point.x - graphView.x, y: point.y - graphView.y }; $('graph-svg').setPointerCapture(event.pointerId);
});
$('graph-svg').addEventListener('pointermove', event => { if (pan) { const point = graphPoint(event); graphView.x = point.x - pan.x; graphView.y = point.y - pan.y; transformGraph(); } });
for (const event of ['pointerup', 'pointercancel']) $('graph-svg').addEventListener(event, () => { pan = null; });
$('zoom-in').addEventListener('click', () => zoom(1.25));
$('zoom-out').addEventListener('click', () => zoom(.8));
$('fit-graph').addEventListener('click', fitGraph);
$('graph-query').addEventListener('input', renderGraph);
$('latest-only').addEventListener('change', renderGraph);
$('reload-graph').addEventListener('click', () => run(() => busy($('reload-graph'), loadGraph)));

async function loadCredentials() {
  const result = await call('/api/credentials');
  const rows = result.credentials.map(credential => {
    const row = node('tr');
    const name = node('td', credential.name); name.append(node('small', credential.prefix));
    const access = node('td', credential.scopes.includes('write') ? 'Read & write' : 'Read only');
    const last = node('td', date(credential.last_used_at));
    const status = node('td', credential.revoked_at ? 'Revoked' : 'Active', credential.revoked_at ? 'revoked' : '');
    const action = node('td');
    if (!credential.revoked_at) {
      const button = node('button', 'Revoke', 'secondary danger');
      button.addEventListener('click', () => run(async () => {
        if (!confirm('Revoke “' + credential.name + '”? Clients using this credential will lose access immediately.')) return;
        await busy(button, () => call('/api/credentials/' + encodeURIComponent(credential.id), { method: 'DELETE' }));
        notify('Credential revoked.'); await loadCredentials();
      }));
      action.append(button);
    }
    row.append(name, access, last, status, action); return row;
  });
  $('credential-list').replaceChildren(...rows);
}
$('credential-form').addEventListener('submit', event => {
  event.preventDefault();
  run(() => busy(event.submitter, async () => {
    const created = await call('/api/credentials', { method: 'POST', body: JSON.stringify({ name: $('credential-name').value, access: $('credential-access').value }) });
    $('new-token').textContent = created.token; $('token-dialog').showModal(); $('credential-name').value = ''; await loadCredentials();
  }));
});
$('token-dialog').addEventListener('close', () => { $('new-token').textContent = ''; });
$('copy-token').addEventListener('click', () => run(() => copy($('new-token').textContent)));
function clientConfig() {
  if (!state.config) return;
  const url = state.config.mcp_url;
  const type = $('client-choice').value;
  let description, config;
  if (type === 'codex') {
    description = 'Add this to ~/.codex/config.toml. The helper in this repository reads MEMORY_MCP_TOKEN from the local environment. Set the absolute helper path, provide the secret to the Codex process, and reconnect MCP.';
    config = '[mcp_servers.personal-memory]\nurl = "' + url + '"\nhttp_headers_helper = "python3 /absolute/path/to/memory/scripts/mcp_headers.py"\nstartup_timeout_sec = 30\ntool_timeout_sec = 150\nenabled = true';
  } else if (type === 'claude') {
    description = 'Claude Code supports remote HTTP headers and environment references. Merge this server entry into your .mcp.json, set MEMORY_MCP_TOKEN locally, and approve/reconnect the server in Claude Code.';
    config = JSON.stringify({ mcpServers: { 'personal-memory': { type: 'http', url, headers: { Authorization: 'Bearer ${MEMORY_MCP_TOKEN}' } } } }, null, 2);
  } else if (type === 'generic') {
    description = 'Hermes example: merge into the active profile’s MCP configuration and store MEMORY_MCP_TOKEN in its secret environment. Other clients need the same HTTP endpoint and bearer header, using their own config syntax.';
    config = 'mcp_servers:\n  personal-memory:\n    url: "' + url + '"\n    headers:\n      Authorization: "Bearer ${MEMORY_MCP_TOKEN}"\n    timeout: 150';
  } else {
    description = 'ChatGPT web uses its own remote app/connector setup; local Codex settings do not configure it. This prototype exposes bearer authentication, and does not yet implement OAuth for web connectors. A secure web connector is a planned integration; do not turn off authentication.';
    config = 'Endpoint: ' + url + '\nStatus: OAuth / web connector integration pending\nThis does not synchronize ChatGPT’s built-in memory.';
  }
  $('client-description').textContent = description; $('client-config').textContent = config;
}
$('client-choice').addEventListener('change', clientConfig);
$('copy-endpoint').addEventListener('click', () => run(() => copy(state.config.mcp_url)));
$('copy-config').addEventListener('click', () => run(() => copy($('client-config').textContent)));

async function loadHandoffs() {
  const result = await call('/api/handoffs');
  $('handoff-list').replaceChildren(...result.handoffs.map(item => {
    const card = memoryCard({ title: item.project, summary: item.context.goal, status: 'v' + item.version, metadata: { source: item.author } }, () => openHandoff(item));
    return card;
  }));
  if (!result.handoffs.length) empty($('handoff-list'), 'No saved task handoffs yet. Create one here or ask an agent to save before switching.');
}
async function openHandoff(item = null) {
  if (item) item = await call('/api/handoffs/' + encodeURIComponent(item.project));
  state.handoffVersion = item?.version || 0;
  state.handoffRequest = crypto.randomUUID();
  $('handoff-project').value = item?.project || ''; $('handoff-project').readOnly = !!item;
  const context = item?.context || {};
  $('handoff-goal').value = context.goal || ''; $('handoff-summary').value = context.summary || '';
  $('handoff-decisions').value = (context.decisions || []).join('\n');
  $('handoff-next').value = (context.next_steps || []).join('\n');
  $('handoff-references').value = (context.references || []).join('\n');
  $('handoff-version').textContent = item ? 'Editing version ' + item.version + ' · ' + date(item.created_at) + ' · ' + item.author : 'New project · First revision';
  $('handoff-error').hidden = true; $('handoff-dialog').showModal();
}
$('new-handoff').addEventListener('click', () => run(() => openHandoff()));
function lines(value) { return value.split('\n').map(item => item.trim()).filter(Boolean); }
$('handoff-form').addEventListener('submit', event => {
  event.preventDefault();
  run(() => busy(event.submitter, async () => {
    $('handoff-error').hidden = true;
    try {
      await call('/api/handoffs', { method: 'POST', body: JSON.stringify({ project: $('handoff-project').value, goal: $('handoff-goal').value,
        summary: $('handoff-summary').value, decisions: lines($('handoff-decisions').value), next_steps: lines($('handoff-next').value),
        references: lines($('handoff-references').value), expected_version: state.handoffVersion, request_id: state.handoffRequest }) });
      $('handoff-dialog').close(); notify('Handoff saved.'); await loadHandoffs();
    } catch (error) { $('handoff-error').textContent = error.message; $('handoff-error').hidden = false; }
  }));
});
for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => $(button.dataset.close).close());
async function showTab(tab) {
  if (!['memories', 'graph', 'handoffs', 'connections'].includes(tab)) tab = 'memories';
  for (const section of document.querySelectorAll('.tab')) section.hidden = section.id !== tab;
  for (const button of document.querySelectorAll('.nav')) {
    button.classList.toggle('active', button.dataset.tab === tab);
    if (button.dataset.tab === tab) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  }
  history.replaceState(null, '', '#' + tab);
  if (tab === 'graph' && !state.graph) await loadGraph();
  if (tab === 'handoffs') await loadHandoffs();
  if (tab === 'connections') { if (!state.config) state.config = await call('/api/config'); $('mcp-endpoint').textContent = state.config.mcp_url; clientConfig(); await loadCredentials(); }
}
for (const button of document.querySelectorAll('[data-tab]')) button.addEventListener('click', () => run(() => showTab(button.dataset.tab)));
run(async () => { await loadMemories(); await showTab(location.hash.slice(1) || 'memories'); });
