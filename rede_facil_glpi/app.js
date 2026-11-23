const $ = id => document.getElementById(id);
const seedTickets = [
{id:1001,title:"Headset sem áudio no atendimento",requester:"Telemarketing",category:"Hardware",priority:"Alta",assignee:"Técnico de TI",status:"Em andamento",description:"Operador relata ausência de áudio no headset. Cenário de exemplo baseado em ocorrência recorrente relatada.",date:"17/11/2026"},
{id:1002,title:"Lentidão em computador do telemarketing",requester:"Telemarketing",category:"Hardware",priority:"Média",assignee:"Estagiário (supervisionado)",status:"Aberto",description:"Computador apresenta lentidão durante o uso. Necessário diagnóstico.",date:"17/11/2026"},
{id:1003,title:"Falha no sistema interno",requester:"Setor administrativo",category:"Software / Sistema",priority:"Alta",assignee:"Desenvolvedor",status:"Pendente",description:"Relato de falha no sistema interno. A causa ainda precisa ser investigada.",date:"16/11/2026"},
{id:1004,title:"Redefinição de senha",requester:"Colaborador",category:"Acesso / Senha",priority:"Baixa",assignee:"Responsável por senhas",status:"Resolvido",description:"Solicitação demonstrativa de redefinição de acesso.",date:"14/11/2026"}
];
const seedAssets = [
{name:"Computador — Telemarketing",type:"Computador",sector:"Telemarketing",condition:"Em uso"},
{name:"Headset — Atendimento",type:"Headset",sector:"Telemarketing",condition:"Manutenção"},
{name:"Computador — Suporte",type:"Computador",sector:"TI",condition:"Em uso"},
{name:"Periféricos diversos",type:"Outro periférico",sector:"A confirmar",condition:"Reserva"}
];
const seedProblems = [
{title:"Falhas recorrentes em headsets",cause:"Causa não confirmada. Investigar desgaste, conexões, configuração de áudio e lote dos equipamentos.",action:"Registrar ocorrências por modelo, realizar testes e avaliar manutenção ou substituição."},
{title:"Falhas em sistemas internos",cause:"Causa não confirmada. Correlacionar horários, mensagens de erro e alterações recentes.",action:"Manter histórico de incidentes, registrar evidências e analisar causa raiz com o desenvolvimento."}
];
const seedGreen = [
{title:"Destinação correta de equipamentos eletrônicos",owner:"Gestão de TI (sugerido)",status:"Planejada"},
{title:"Redução do consumo de energia",owner:"Equipe de TI (sugerido)",status:"Planejada"},
{title:"Reutilização de equipamentos em condições adequadas",owner:"Técnico de TI (sugerido)",status:"Planejada"},
{title:"Redução de impressões e uso de documentos digitais",owner:"A definir",status:"Planejada"}
];
let tickets = load("rf_tickets",seedTickets), assets=load("rf_assets",seedAssets), problems=load("rf_problems",seedProblems), green=load("rf_green",seedGreen);
function load(key, fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch(e){return fallback}}
function save(){localStorage.setItem("rf_tickets",JSON.stringify(tickets));localStorage.setItem("rf_assets",JSON.stringify(assets));localStorage.setItem("rf_problems",JSON.stringify(problems));localStorage.setItem("rf_green",JSON.stringify(green));renderAll()}
function showPage(page){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===page));document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===page));const names={dashboard:"Painel",tickets:"Chamados",assets:"Ativos / Inventário",problems:"Problemas",team:"Equipe de TI",green:"TI Verde"};$("pageTitle").textContent=names[page];}
document.querySelectorAll(".nav").forEach(n=>n.addEventListener("click",()=>showPage(n.dataset.page)));
function badge(value){let cls=value==="Alta"?"red":value==="Média"?"yellow":value==="Baixa"?"green":value==="Resolvido"||value==="Concluída"?"green":value==="Em andamento"?"blue":value==="Pendente"?"yellow":"";return `<span class="pill ${cls}">${value}</span>`}
function renderDashboard(){
let open=tickets.filter(t=>t.status==="Aberto").length, progress=tickets.filter(t=>t.status==="Em andamento"||t.status==="Pendente").length, solved=tickets.filter(t=>t.status==="Resolvido").length;
$("statOpen").textContent=open;$("statProgress").textContent=progress;$("statSolved").textContent=solved;$("statAssets").textContent=assets.length;$("navOpen").textContent=open;
let recent=[...tickets].sort((a,b)=>b.id-a.id).slice(0,5);
$("recentTickets").innerHTML=recent.length?`<table><thead><tr><th>Nº</th><th>Chamado</th><th>Prioridade</th><th>Status</th></tr></thead><tbody>${recent.map(t=>`<tr><td class="ticket-number">#${t.id}</td><td>${esc(t.title)}</td><td>${badge(t.priority)}</td><td>${badge(t.status)}</td></tr>`).join("")}</tbody></table>`:'<div class="empty">Nenhum chamado registrado.</div>';
let active=tickets.filter(t=>t.status!=="Resolvido"), counts=["Alta","Média","Baixa"].map(p=>[p,active.filter(t=>t.priority===p).length]), max=Math.max(1,...counts.map(c=>c[1]));
$("priorityBars").innerHTML=counts.map(([p,n])=>`<div class="bar-row"><span>${p}</span><div class="bar-track"><div class="bar-fill ${p==="Alta"?"red":p==="Média"?"yellow":"green"}" style="width:${n/max*100}%"></div></div><b>${n}</b></div>`).join("");
}
function renderTickets(){let q=($("ticketSearch")?.value||"").toLowerCase(),s=$("statusFilter")?.value||"",p=$("priorityFilter")?.value||"";let rows=tickets.filter(t=>(!s||t.status===s)&&(!p||t.priority===p)&&(`${t.id} ${t.title} ${t.requester} ${t.assignee}`.toLowerCase().includes(q))).sort((a,b)=>b.id-a.id);
$("ticketsTable").innerHTML=rows.length?`<table><thead><tr><th>Nº</th><th>Título / solicitante</th><th>Categoria</th><th>Prioridade</th><th>Responsável</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows.map(t=>`<tr><td class="ticket-number">#${t.id}</td><td><b>${esc(t.title)}</b><br><small>${esc(t.requester)} • ${t.date}</small></td><td>${esc(t.category)}</td><td>${badge(t.priority)}</td><td>${esc(t.assignee)}</td><td><select aria-label="Alterar status" onchange="changeStatus(${t.id},this.value)">${["Aberto","Em andamento","Pendente","Resolvido"].map(x=>`<option ${x===t.status?"selected":""}>${x}</option>`).join("")}</select></td><td><button class="action-btn" onclick="editTicket(${t.id})">Editar</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Nenhum chamado encontrado com esses filtros.</div>'}
function renderAssets(){$("assetsTable").innerHTML=assets.length?`<table><thead><tr><th>Ativo</th><th>Tipo</th><th>Setor</th><th>Condição</th><th>Ação</th></tr></thead><tbody>${assets.map((a,i)=>`<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.type)}</td><td>${esc(a.sector)}</td><td>${badge(a.condition)}</td><td><button class="action-btn" onclick="removeAsset(${i})">Remover</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Nenhum ativo cadastrado.</div>'}
function renderProblems(){$("problemsList").innerHTML=problems.map(p=>`<article class="info-card"><span class="pill yellow">Investigação / prevenção</span><h3>${esc(p.title)}</h3><p><b>Possível causa:</b> ${esc(p.cause)}</p><p><b>Ação preventiva:</b> ${esc(p.action)}</p><div class="meta">ITIL 4 • Gerenciamento de problemas</div></article>`).join("")||'<div class="empty">Nenhum problema registrado.</div>'}
function renderTeam(){let people=[["Gestor de TI","Planejamento, prioridades e acompanhamento.","♙"],["Desenvolvedor","Manutenção e evolução dos sistemas internos.","⌘"],["Responsável por senhas","Administração de senhas e acessos.","▣"],["Técnico de TI","Manutenção, trocas e suporte aos equipamentos.","⚙"],["Estagiário","Apoio operacional e trocas urgentes sob supervisão.","♧"]];$("teamGrid").innerHTML=people.map(p=>`<div class="person"><div class="person-icon">${p[2]}</div><b>${p[0]}</b><small>${p[1]}</small></div>`).join("")}
function renderGreen(){$("greenCount").textContent=green.length;$("greenDone").textContent=green.filter(g=>g.status==="Concluída").length;$("greenList").innerHTML=green.map((g,i)=>`<article class="info-card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center">${badge(g.status)}<button class="action-btn" onclick="cycleGreen(${i})">Alterar status</button></div><h3 style="margin-top:12px">${esc(g.title)}</h3><p>Responsável sugerido: ${esc(g.owner||"A definir")}</p><div class="meta">ISO 14001 • TI Verde</div></article>`).join("")||'<div class="empty">Nenhuma ação cadastrada.</div>'}
function renderAll(){renderDashboard();renderTickets();renderAssets();renderProblems();renderTeam();renderGreen()}
function openModal(id){$(id).classList.add("show")}function closeModal(id){$(id).classList.remove("show")}
function openTicketModal(){ $("ticketForm").reset();$("ticketId").value="";$("ticketModalTitle").textContent="Novo chamado";openModal("ticketModal")}
function editTicket(id){let t=tickets.find(x=>x.id===id);if(!t)return;$("ticketId").value=t.id;$("tTitle").value=t.title;$("tRequester").value=t.requester;$("tCategory").value=t.category;$("tPriority").value=t.priority;$("tAssignee").value=t.assignee;$("tStatus").value=t.status;$("tDescription").value=t.description;$("ticketModalTitle").textContent=`Editar chamado #${id}`;openModal("ticketModal")}
function changeStatus(id,status){let t=tickets.find(x=>x.id===id);if(t){t.status=status;save();toast("Status do chamado atualizado.")}}
$("ticketForm").addEventListener("submit",e=>{e.preventDefault();let id=Number($("ticketId").value),data={title:$("tTitle").value.trim(),requester:$("tRequester").value.trim(),category:$("tCategory").value,priority:$("tPriority").value,assignee:$("tAssignee").value,status:$("tStatus").value,description:$("tDescription").value.trim()};if(id){Object.assign(tickets.find(t=>t.id===id),data);toast("Chamado atualizado.")}else{tickets.push({id:Math.max(1000,...tickets.map(t=>t.id))+1,...data,date:new Date().toLocaleDateString("pt-BR")});toast("Chamado registrado.")}save();closeModal("ticketModal")});
function openAssetModal(){$("assetForm").reset();openModal("assetModal")}
$("assetForm").addEventListener("submit",e=>{e.preventDefault();assets.push({name:$("aName").value.trim(),type:$("aType").value,sector:$("aSector").value.trim()||"A confirmar",condition:$("aCondition").value});save();closeModal("assetModal");toast("Ativo cadastrado.")});
function removeAsset(i){if(confirm("Remover este ativo do inventário demonstrativo?")){assets.splice(i,1);save();toast("Ativo removido.")}}
function openProblemModal(){$("problemForm").reset();openModal("problemModal")}
$("problemForm").addEventListener("submit",e=>{e.preventDefault();problems.push({title:$("pTitle").value.trim(),cause:$("pCause").value.trim()||"A investigar",action:$("pAction").value.trim()||"Definir ação preventiva"});save();closeModal("problemModal");toast("Problema registrado.")});
function openGreenModal(){$("greenForm").reset();openModal("greenModal")}
$("greenForm").addEventListener("submit",e=>{e.preventDefault();green.push({title:$("gTitle").value.trim(),owner:$("gOwner").value.trim()||"A definir",status:$("gStatus").value});save();closeModal("greenModal");toast("Ação sustentável registrada.")});
function cycleGreen(i){let order=["Planejada","Em andamento","Concluída"];green[i].status=order[(order.indexOf(green[i].status)+1)%order.length];save();toast("Status da ação atualizado.")}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
let toastTimer;function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2600)}
document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("show")}));
renderAll();
