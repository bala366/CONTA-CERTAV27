
const KEY='conta_certa_android_web_v4';
let db={}; let current='dashboard'; let carrinho=[];

const modules=[
 ['dashboard','🏠 Visão Geral'],
 ['titulos_pagar','↓ Contas a Pagar'],
 ['caixa_despesas','└ Caixa Diário — Despesas'],
 ['titulos_receber','↑ Contas a Receber'],
 ['caixa_receitas','└ Caixa Diário — Receitas'],
 ['vendas','🛒 Nova Venda'],
 ['clientes','👥 Clientes / Participantes'],
 ['fornecedores','🚚 Fornecedores'],
 ['produtos','📦 Produtos / Estoque'],
 ['plano_contas','📚 Plano de Contas'],
 ['centros_custo','🎯 Centros de Custo'],
 ['bancos','🏦 Contas Financeiras'],
 ['boletos','🧾 Controle de Boletos'],
 ['fiado','💬 Controle de Fiado'],
 ['cheques','💳 Controle de Cheques'],
 ['juros_cheques','└ Juros de Cheques'],
 ['desconto_juros','└ Desconto de Juros'],
 ['dre','📊 DRE'],
 ['livro_caixa','📘 Livro Caixa'],
 ['livro_diario','📙 Livro Diário'],
 ['livro_razao','📗 Livro Razão'],
 ['balancete','📒 Balancete'],
 ['estoque_extrato','📦 Extrato de Estoque'],
 ['inventario_ajuste','🧮 Inventário / Ajuste'],
 ['relatorios','📄 Relatórios'],
 ['auditoria','🔎 Auditoria']
];

async function boot(){
  let saved=localStorage.getItem(KEY);
  if(saved){db=JSON.parse(saved);}
  else{
    try{ db=await (await fetch('current_db.json')).json(); }
    catch(e){ db=await (await fetch('seed.json')).json(); }
    for(const k of ['caixa_receitas','caixa_despesas','titulos','boletos','fiado','vendas','estoque_movimentos','cheques','juros_cheques','desconto_juros','conta_movimentos']) db[k]=db[k]||[];
    save();
  }
  buildNav(); show('dashboard');
  if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js').catch(()=>{});}
}
function save(){localStorage.setItem(KEY,JSON.stringify(db));}
function brl(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function today(){return new Date().toISOString().slice(0,10);}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function nextId(arr){return (arr||[]).reduce((m,x)=>Math.max(m,Number(x.id)||0),0)+1;}
function num(v){const n=Number(String(v??'').replace(',','.')); return Number.isFinite(n)?n:0;}
function ccPrint(){if(window.Android&&Android.printPage){Android.printPage();}else{window.print();}}

function buildNav(){
  const nav=document.querySelector('nav');nav.innerHTML='';
  modules.forEach(([k,n])=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>show(k);nav.appendChild(b);});
}
function show(k){
  current=k;document.querySelector('nav').classList.remove('open');const m=document.querySelector('main');m.innerHTML='';
  if(k==='dashboard')return dashboard(m);
  if(k==='titulos_pagar')return tituloForm(m,'PAGAR');
  if(k==='titulos_receber')return tituloForm(m,'RECEBER');
  if(k==='caixa_despesas')return caixaForm(m,'DESPESA');
  if(k==='caixa_receitas')return caixaForm(m,'RECEITA');
  if(k==='clientes')return cadastroPessoas(m,'clientes','Clientes / Participantes');
  if(k==='fornecedores')return cadastroPessoas(m,'fornecedores','Fornecedores');
  if(k==='produtos')return cadastroProdutos(m);
  if(k==='vendas')return novaVenda(m);
  if(k==='bancos')return contasFinanceiras(m);
  if(k==='boletos')return boletos(m);
  if(k==='fiado')return fiado(m);
  if(k==='cheques')return cheques(m);
  if(k==='juros_cheques')return jurosCheques(m);
  if(k==='desconto_juros')return descontoJuros(m);
  if(k==='dre')return dre(m);
  if(k==='livro_caixa')return livroCaixa(m);
  if(k==='livro_diario')return livroDiario(m);
  if(k==='livro_razao')return livroRazao(m);
  if(k==='balancete')return balancete(m);
  if(k==='estoque_extrato')return estoqueExtrato(m);
  if(k==='inventario_ajuste')return inventarioAjuste(m);
  if(k==='relatorios')return relatorios(m);
  if(k==='auditoria')return auditoria(m);
  return tableModule(m,k,modules.find(x=>x[0]===k)?.[1]||k);
}
function dashboard(m){
  const tit=db.titulos||[];
  const aberto=(tipo)=>tit.filter(x=>x.tipo===tipo&&String(x.status||'ABERTO').toUpperCase()!=='BAIXADO')
    .reduce((s,x)=>s+Math.max(0,num(x.valor)-num(x.valor_baixado)),0);
  const vendasHoje=(db.vendas||[]).filter(x=>x.data===today()).reduce((s,x)=>s+num(x.total),0);
  const cards=[
    ['Receitas em aberto',brl(aberto('RECEBER'))],['Despesas em aberto',brl(aberto('PAGAR'))],
    ['Vendas hoje',brl(vendasHoje)],['Clientes',(db.clientes||[]).length],
    ['Fornecedores',(db.fornecedores||[]).length],['Produtos',(db.produtos||[]).length],
    ['Boletos',(db.boletos||[]).length],['Fiados',(db.fiado||[]).length]
  ];
  m.innerHTML=`<h2>Dashboard</h2><div class=cards>${cards.map(x=>`<div class=card><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('')}</div>
  <div class=card style="margin-top:12px"><b>Ações rápidas</b><div class=toolbar>
  <button class=action onclick="show('vendas')">Nova venda</button>
  <button class=action onclick="show('titulos_pagar')">Nova despesa</button>
  <button class=action onclick="show('titulos_receber')">Nova receita</button>
  <button class=action onclick="show('clientes')">Novo cliente</button>
  <button class=action onclick="show('produtos')">Novo produto</button>
  </div></div>`;
}

/* CADASTROS */
function cadastroPessoas(m,key,title){
  m.innerHTML=`<h2>${title}</h2><div class=card><div class=grid>
  <label>Nome / Razão Social<input id=pnome></label><label>Documento<input id=pdoc></label>
  <label>Telefone<input id=ptel></label><label>E-mail<input id=pemail></label>
  <label>Cidade<input id=pcidade></label><label>UF<input id=puf maxlength=2></label>
  </div><div class=toolbar><button class=action onclick="salvarPessoa('${key}')">SALVAR</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div></div>
  <div class=toolbar><input id=q placeholder="Pesquisar..." style="max-width:320px;margin:0"></div><div id=plist></div>`;
  q.oninput=()=>drawPessoas(key);drawPessoas(key);
}
function salvarPessoa(key){
  if(!pnome.value.trim()){alert('Informe o nome.');return;}
  const arr=db[key]||[];
  arr.push({id:nextId(arr),nome:pnome.value.trim(),razao_social:pnome.value.trim(),documento:pdoc.value,telefone:ptel.value,email:pemail.value,cidade:pcidade.value,estado:puf.value.toUpperCase(),situacao:'ativado'});
  db[key]=arr;save();show(key);
}
function drawPessoas(key){
  const qq=(q.value||'').toLowerCase(),a=(db[key]||[]).filter(x=>JSON.stringify(x).toLowerCase().includes(qq));
  plist.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Nome</th><th>Documento</th><th>Telefone</th><th>Cidade</th><th>UF</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.nome||x.razao_social)}</td><td>${esc(x.documento)}</td><td>${esc(x.telefone)}</td><td>${esc(x.cidade)}</td><td>${esc(x.estado)}</td></tr>`).join('')}</tbody></table></div>`;
}
function cadastroProdutos(m){
  const produtos=(db.produtos||[]).map(x=>`<option value="${x.id}">${esc((x.codigo||'')+' - '+(x.descricao||''))}</option>`).join('');
  const primeiro=new Date();primeiro.setDate(1);const ini=primeiro.toISOString().slice(0,10);
  m.innerHTML=`<h2>Produtos / Estoque</h2><div class=card><div class=grid>
  <label>Código<input id=cod></label><label>Descrição<input id=desc></label><label>Unidade<input id=unidade></label>
  <label>Estoque inicial<input id=estoque type=number step=.001></label><label>Custo<input id=custo type=number step=.01></label><label>Preço<input id=preco type=number step=.01></label><label>NCM<input id=ncm></label>
  </div><div class=toolbar><button class=action onclick="salvarProduto()">SALVAR</button><button class="action gold" onclick="ccPrint()">PDF CADASTRO</button></div></div>
  <div class=card style="margin-top:10px"><h3>Extrato de movimentação de produtos</h3><div class=grid>
  <label>Produto<select id=rproduto><option value="">TODOS OS PRODUTOS</option>${produtos}</select></label>
  <label>Data inicial<input id=rinicio type=date value="${ini}"></label><label>Data final<input id=rfinal type=date value="${today()}"></label>
  </div><div class=toolbar><button class="action gold" onclick="relatorioMovProdutos()">GERAR EXTRATO / PDF</button></div></div>
  <div class=toolbar><input id=q placeholder="Pesquisar código ou descrição..." style="max-width:320px;margin:0"></div><div id=prodlist></div>`;
  q.oninput=drawProdutos;drawProdutos();
}
function salvarProduto(){
  if(!desc.value.trim()){alert('Informe a descrição.');return;}
  const arr=db.produtos||[];
  const novo={id:nextId(arr),codigo:cod.value||String(nextId(arr)),descricao:desc.value.trim(),unidade:unidade.value||'UN',estoque:num(estoque.value),custo:num(custo.value),preco:num(preco.value),ncm:ncm.value};
  arr.push(novo);db.produtos=arr;
  if(novo.estoque!==0)(db.estoque_movimentos??=[]).push({id:Date.now(),produto_id:novo.id,data:today(),tipo:'ENTRADA',quantidade:novo.estoque,origem:'SALDO INICIAL',documento:''});
  save();show('produtos');
}
function drawProdutos(){
  const qq=(q.value||'').toLowerCase();const a=(db.produtos||[]).filter(x=>JSON.stringify(x).toLowerCase().includes(qq));
  prodlist.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Código</th><th>Descrição</th><th>Un.</th><th>Estoque</th><th>Custo</th><th>Preço</th><th>NCM</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.descricao)}</td><td>${esc(x.unidade)}</td><td>${x.estoque??0}</td><td>${brl(x.custo)}</td><td>${brl(x.preco)}</td><td>${esc(x.ncm)}</td></tr>`).join('')}</tbody></table></div>`;
}
function movSinal(m){
  const t=String(m.tipo||'').toUpperCase(),q=Math.abs(num(m.quantidade));
  if(t.includes('SAIDA')||t.includes('VENDA')||t.includes('BAIXA'))return -q;
  if(t.includes('ENTRADA')||t.includes('COMPRA'))return q;
  return num(m.quantidade);
}
function relatorioMovProdutos(){
  const ini=rinicio.value, fim=rfinal.value;if(!ini||!fim||fim<ini){alert('Informe um período válido.');return}
  const pid=String(rproduto.value||'');const produtos=(db.produtos||[]).filter(x=>!pid||String(x.id)===pid);const mov=db.estoque_movimentos||[];
  const rows=produtos.map(p=>{
    const pm=mov.filter(x=>String(x.produto_id)===String(p.id));
    const netAll=pm.reduce((s,x)=>s+movSinal(x),0);const base=num(p.estoque)-netAll;
    const antes=pm.filter(x=>String(x.data||'')<ini).reduce((s,x)=>s+movSinal(x),0);
    const periodo=pm.filter(x=>String(x.data||'')>=ini&&String(x.data||'')<=fim);
    const entradas=periodo.reduce((s,x)=>s+Math.max(0,movSinal(x)),0);
    const saidas=periodo.reduce((s,x)=>s+Math.max(0,-movSinal(x)),0);
    const anterior=base+antes,final=anterior+entradas-saidas;
    return {codigo:p.codigo,descricao:p.descricao,unidade:p.unidade,anterior,entradas,saidas,final,custo:num(p.custo),valor:final*num(p.custo)};
  });
  const totalValor=rows.reduce((s,x)=>s+x.valor,0);
  document.querySelector('main').innerHTML=`<h2>Extrato de Movimentação de Produtos</h2><div class=card><b>Período:</b> ${esc(ini)} até ${esc(fim)}<br><b>Produtos:</b> ${rows.length}<br><b>Valor do estoque final:</b> ${brl(totalValor)}</div>
  <div class=toolbar><button class=action onclick="show('produtos')">VOLTAR</button><button class="action gold" onclick="ccPrint()">SALVAR PDF</button></div>
  <div class=tablewrap><table class=tbl><thead><tr><th>Código</th><th>Produto</th><th>Un.</th><th>Saldo anterior</th><th>Entradas</th><th>Saídas</th><th>Saldo final</th><th>Custo</th><th>Valor final</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.descricao)}</td><td>${esc(x.unidade)}</td><td>${x.anterior.toFixed(3)}</td><td>${x.entradas.toFixed(3)}</td><td>${x.saidas.toFixed(3)}</td><td>${x.final.toFixed(3)}</td><td>${brl(x.custo)}</td><td>${brl(x.valor)}</td></tr>`).join('')}</tbody></table></div>`;
}

/* FINANCEIRO */
/* FINANCEIRO */
function tituloForm(m,tipo){
  const pagar=tipo==='PAGAR';const pessoas=pagar?(db.fornecedores||[]): (db.clientes||[]);
  const opts=pessoas.map(x=>`<option value="${x.id}">${esc(x.nome||x.razao_social)}</option>`).join('');
  const contas=(db.plano_contas||[]).map(x=>`<option value="${x.id}">${esc((x.codigo||'')+' - '+(x.nome||''))}</option>`).join('');
  const bancos=(db.bancos||[]).map(x=>`<option value="${x.id}">${esc(x.nome||'')}</option>`).join('');
  m.innerHTML=`<h2>${pagar?'Contas a Pagar':'Contas a Receber'}</h2><div class=card><div class=grid>
  <label>${pagar?'Fornecedor':'Cliente'}<select id=pessoa><option value="">Selecione</option>${opts}</select></label>
  <label>Documento<input id=documento></label><label>Emissão<input id=emissao type=date value="${today()}"></label>
  <label>Vencimento<input id=vencimento type=date></label><label>Valor<input id=valor type=number step=.01></label>
  <label>Plano de contas<select id=plano><option value="">Selecione</option>${contas}</select></label>
  <label>Banco / Caixa<select id=banco><option value="">Selecione</option>${bancos}</select></label>
  <label>Histórico<input id=historico></label></div><div class=toolbar>
  <button class=action onclick="salvarTitulo('${tipo}')">LANÇAR</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div></div><div id=titlist></div>`;
  drawTitulos(tipo);
}
function salvarTitulo(tipo){
  if(!valor.value||num(valor.value)<=0){alert('Informe o valor.');return}
  if(!vencimento.value){alert('Informe o vencimento.');return}
  const pessoas=tipo==='PAGAR'?(db.fornecedores||[]): (db.clientes||[]);
  const p=pessoas.find(x=>String(x.id)===String(pessoa.value));
  const pc=(db.plano_contas||[]).find(x=>String(x.id)===String(plano.value));
  const bk=(db.bancos||[]).find(x=>String(x.id)===String(banco.value));
  (db.titulos??=[]).push({id:Date.now(),tipo,pessoa_id:p?.id||null,pessoa:p?.nome||'',documento:documento.value,emissao:emissao.value,vencimento:vencimento.value,valor:num(valor.value),valor_baixado:0,status:'ABERTO',plano_conta:pc?.nome||'',banco:bk?.nome||'',historico:historico.value});
  save();show(tipo==='PAGAR'?'titulos_pagar':'titulos_receber');
}
function drawTitulos(tipo){
  const a=(db.titulos||[]).filter(x=>x.tipo===tipo);
  titlist.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Pessoa</th><th>Documento</th><th>Vencimento</th><th>Valor</th><th>Status</th><th>Ação</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.pessoa)}</td><td>${esc(x.documento)}</td><td>${esc(x.vencimento)}</td><td>${brl(x.valor)}</td><td>${esc(x.status)}</td><td>${x.status==='BAIXADO'?'—':`<button class=mini onclick="baixar(${x.id})">Baixar</button>`}</td></tr>`).join('')}</tbody></table></div>`;
}
function baixar(id){
  const t=(db.titulos||[]).find(x=>x.id===id);if(!t)return;
  if(!t.banco){alert('Este título não possui Conta Financeira definida. Edite/refaça o lançamento informando Banco / Caixa antes da baixa.');return}
  t.valor_baixado=num(t.valor);t.status='BAIXADO';t.data_baixa=today();
  const key=t.tipo==='RECEBER'?'caixa_receitas':'caixa_despesas';db[key]??=[];
  db[key].push({id:Date.now(),data:today(),categoria:t.plano_conta||'',descricao:'Baixa '+(t.documento||''),banco:t.banco||'',valor:num(t.valor),origem_titulo_id:t.id});
  movConta(t.banco,t.tipo==='RECEBER'?'CRÉDITO':'DÉBITO',t.valor,'Baixa '+(t.documento||''),t.documento||'');
  save();show(t.tipo==='RECEBER'?'titulos_receber':'titulos_pagar');
}
function caixaForm(m,tipo){
  const receita=tipo==='RECEITA',key=receita?'caixa_receitas':'caixa_despesas';db[key]??=[];
  const contas=(db.bancos||[]).filter(x=>String(x.ativo)!=='0').map(x=>`<option value="${x.id}">${esc(x.nome||'')}</option>`).join('');
  m.innerHTML=`<h2>Caixa Diário — ${receita?'Receitas':'Despesas'}</h2><div class=card><div class=grid>
  <label>Data<input id=cdata type=date value="${today()}"></label><label>Categoria<input id=ccat></label><label>Descrição<input id=cdesc></label>
  <label>Conta Financeira<select id=cbanco><option value="">Selecione</option>${contas}</select></label><label>Valor<input id=cvalor type=number step=.01></label>
  </div><div class=toolbar><button class=action onclick="salvarCaixa('${tipo}')">SALVAR E INTEGRAR</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div></div><div id=cxlist></div>`;
  drawCaixa(key);
}
function salvarCaixa(tipo){
  const key=tipo==='RECEITA'?'caixa_receitas':'caixa_despesas';if(!cvalor.value||num(cvalor.value)<=0){alert('Informe o valor.');return}
  const conta=(db.bancos||[]).find(x=>String(x.id)===String(cbanco.value));if(!conta){alert('Selecione a Conta Financeira.');return}
  const r={id:Date.now(),data:cdata.value,categoria:ccat.value,descricao:cdesc.value,banco:conta.nome,valor:num(cvalor.value),tipo};db[key].push(r);
  movConta(conta.nome,tipo==='RECEITA'?'CRÉDITO':'DÉBITO',r.valor,r.descricao||r.categoria,'CAIXA');
  save();show(tipo==='RECEITA'?'caixa_receitas':'caixa_despesas');
}
function drawCaixa(key){
  const a=(db[key]||[]).slice().reverse();
  cxlist.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Data</th><th>Categoria</th><th>Descrição</th><th>Conta</th><th>Valor</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.data)}</td><td>${esc(x.categoria)}</td><td>${esc(x.descricao)}</td><td>${esc(x.banco)}</td><td>${brl(x.valor)}</td></tr>`).join('')}</tbody></table></div>`;
}

/* NOVA VENDA */
/* NOVA VENDA */
function novaVenda(m){
  carrinho=[];
  const clientes=(db.clientes||[]).map(x=>`<option value="${x.id}">${esc((x.codigo_externo||x.id)+' - '+(x.nome||''))}</option>`).join('');
  const produtos=(db.produtos||[]).map(x=>`<option value="${x.id}">${esc((x.codigo||'')+' - '+(x.descricao||''))}</option>`).join('');
  const contas=(db.bancos||[]).filter(x=>String(x.ativo)!=='0').map(x=>`<option value="${x.id}">${esc(x.nome||'')}</option>`).join('');
  m.innerHTML=`<h2>Nova Venda</h2>
  <div class=card><div class=grid>
   <label>Cliente<select id=vcliente><option value="">Selecione</option>${clientes}</select></label>
   <label>Data<input id=vdata type=date value="${today()}"></label>
   <label>Forma de pagamento<select id=vforma><option>Dinheiro</option><option>PIX</option><option>Cartão</option><option>Boleto</option><option>A prazo</option><option>Fiado</option></select></label>
   <label>Conta Financeira / Caixa<select id=vconta><option value="">Selecione</option>${contas}</select></label>
   <label>Vencimento<input id=vvenc type=date value="${today()}"></label>
  </div></div>
  <div class=card style="margin-top:10px"><h3>Adicionar produto</h3><div class=grid>
   <label>Produto<select id=vproduto><option value="">Selecione</option>${produtos}</select></label>
   <label>Quantidade<input id=vqtd type=number step=.001 value="1"></label>
   <label>Preço unitário<input id=vpreco type=number step=.01></label>
  </div><div class=toolbar><button class=action onclick="carregarPreco()">USAR PREÇO CADASTRADO</button><button class=action onclick="addItem()">ADICIONAR ITEM</button></div></div>
  <h3>Itens da venda</h3><div id=cart></div>
  <div class=card style="margin-top:10px"><div class=totalbox>Total da venda: <strong id=vtotal>${brl(0)}</strong></div>
  <div class=toolbar><button class=action onclick="finalizarVenda()">FINALIZAR VENDA</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR PEDIDO</button></div></div>
  <h3>Últimas vendas</h3><div id=vendaslist></div>`;
  drawCart();drawVendas();
}
function carregarPreco(){
  const p=(db.produtos||[]).find(x=>String(x.id)===String(vproduto.value));
  if(!p){alert('Selecione o produto.');return}vpreco.value=num(p.preco).toFixed(2);
}
function addItem(){
  const p=(db.produtos||[]).find(x=>String(x.id)===String(vproduto.value));if(!p){alert('Selecione o produto.');return}
  const qtd=num(vqtd.value),pr=num(vpreco.value||p.preco);if(qtd<=0){alert('Informe a quantidade.');return}
  if(num(p.estoque)<qtd){if(!confirm(`Estoque atual: ${p.estoque||0}. Deseja continuar mesmo assim?`))return;}
  carrinho.push({produto_id:p.id,codigo:p.codigo,descricao:p.descricao,unidade:p.unidade,qtd,preco:pr,total:qtd*pr});drawCart();vproduto.value='';vqtd.value='1';vpreco.value='';
}
function removeItem(i){carrinho.splice(i,1);drawCart();}
function drawCart(){
  const el=document.querySelector('#cart');if(!el)return;
  el.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Código</th><th>Produto</th><th>Qtd</th><th>Preço</th><th>Total</th><th></th></tr></thead><tbody>${carrinho.map((x,i)=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.descricao)}</td><td>${x.qtd}</td><td>${brl(x.preco)}</td><td>${brl(x.total)}</td><td><button class=mini onclick="removeItem(${i})">Remover</button></td></tr>`).join('')}</tbody></table></div>`;
  const total=carrinho.reduce((s,x)=>s+x.total,0);const vt=document.querySelector('#vtotal');if(vt)vt.textContent=brl(total);
}
function finalizarVenda(){
  if(!carrinho.length){alert('Adicione pelo menos um produto.');return}const cli=(db.clientes||[]).find(x=>String(x.id)===String(vcliente.value));if(!cli){alert('Selecione o cliente.');return}
  const conta=(db.bancos||[]).find(x=>String(x.id)===String(vconta.value));const forma=vforma.value;
  if(['Dinheiro','PIX','Cartão'].includes(forma)&&!conta){alert('Selecione a Conta Financeira / Caixa que receberá a venda.');return}
  const total=carrinho.reduce((s,x)=>s+x.total,0),numero='V'+String(Date.now()).slice(-8);
  const venda={id:Date.now(),numero,data:vdata.value,cliente_id:cli.id,cliente_nome:cli.nome,condicao:forma,conta:conta?.nome||'',vencimento:vvenc.value,total,itens:carrinho.map(x=>({...x}))};db.vendas??=[];db.vendas.push(venda);
  for(const item of carrinho){const p=(db.produtos||[]).find(x=>x.id===item.produto_id);if(p)p.estoque=num(p.estoque)-item.qtd;(db.estoque_movimentos??=[]).push({id:Date.now()+Math.random(),produto_id:item.produto_id,data:vdata.value,tipo:'SAIDA',quantidade:item.qtd,origem:'VENDA',documento:numero});}
  if(['Boleto','A prazo','Fiado'].includes(forma)){
    db.titulos??=[];db.titulos.push({id:Date.now()+1,tipo:'RECEBER',pessoa_id:cli.id,pessoa:cli.nome,documento:numero,emissao:vdata.value,vencimento:vvenc.value,valor:total,valor_baixado:0,status:'ABERTO',plano_conta:'Vendas',banco:conta?.nome||'',historico:'Venda '+numero});
    if(forma==='Boleto'){db.boletos??=[];db.boletos.push({id:Date.now()+2,codigo:numero,cliente_id:cli.id,cliente:cli.nome,banco:conta?.nome||'',emissao:vdata.value,vencimento:vvenc.value,valor:total,total,situacao:'EM ABERTO'});}
    if(forma==='Fiado'){db.fiado??=[];db.fiado.push({id:Date.now()+3,cliente_id:cli.id,cliente:cli.nome,data:vdata.value,tipo:'DÉBITO',descricao:'Venda '+numero,valor:total});}
  } else {
    db.caixa_receitas??=[];db.caixa_receitas.push({id:Date.now()+4,data:vdata.value,categoria:'VENDA',descricao:'Venda '+numero,banco:conta.nome,valor:total});movConta(conta.nome,'CRÉDITO',total,'Venda '+numero,numero);
  }
  save();alert('Venda '+numero+' salva. Estoque, financeiro e Conta Financeira atualizados.');show('vendas');
}
function drawVendas(){
  const el=document.querySelector('#vendaslist');if(!el)return;const a=(db.vendas||[]).slice().reverse().slice(0,30);
  el.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Número</th><th>Data</th><th>Cliente</th><th>Forma</th><th>Conta</th><th>Total</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.numero)}</td><td>${esc(x.data)}</td><td>${esc(x.cliente_nome)}</td><td>${esc(x.condicao)}</td><td>${esc(x.conta||'')}</td><td>${brl(x.total)}</td></tr>`).join('')}</tbody></table></div>`;
}

function boletos(m){
 const clientes=(db.clientes||[]).map(x=>`<option value="${x.id}">${esc((x.codigo_externo||x.id)+' - '+(x.nome||''))}</option>`).join('');
 const bancos=(db.bancos||[]).filter(x=>String(x.ativo)!=='0').map(x=>`<option value="${x.id}">${esc(x.nome||'')}</option>`).join('');
 m.innerHTML=`<h2>Controle de Boletos</h2><div class=card><div class=grid>
 <label>Código / Nosso número<input id=bcodigo></label><label>Cliente<select id=bcliente><option value="">Selecione</option>${clientes}</select></label>
 <label>Conta Financeira de recebimento<select id=bbanco><option value="">Selecione</option>${bancos}</select></label><label>Emissão<input id=bemissao type=date value="${today()}"></label>
 <label>Vencimento<input id=bvenc type=date></label><label>Valor<input id=bvalor type=number step=.01></label>
 <label>Juros<input id=bjuros type=number step=.01 value="0"></label><label>Multa<input id=bmulta type=number step=.01 value="0"></label>
 <label>Desconto<input id=bdesconto type=number step=.01 value="0"></label><label>Observação<input id=bobs></label>
 </div><div class=toolbar><button class=action onclick="salvarBoleto()">SALVAR BOLETO</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div></div>
 <div class=toolbar><input id=bq placeholder="Pesquisar boleto..." style="max-width:320px;margin:0"></div><div id=blista></div>`;bq.oninput=drawBoletos;drawBoletos();
}
function salvarBoleto(){
 if(!bcliente.value||!bvenc.value||num(bvalor.value)<=0){alert('Preencha cliente, vencimento e valor.');return}const cli=(db.clientes||[]).find(x=>String(x.id)===String(bcliente.value));const bk=(db.bancos||[]).find(x=>String(x.id)===String(bbanco.value));
 const total=num(bvalor.value)+num(bjuros.value)+num(bmulta.value)-num(bdesconto.value),id=Date.now(),codigo=bcodigo.value.trim()||('B'+String(id).slice(-8));
 db.boletos??=[];db.boletos.push({id,codigo,cliente_id:cli?.id||null,cliente:cli?.nome||'',banco:bk?.nome||'',emissao:bemissao.value,vencimento:bvenc.value,valor:num(bvalor.value),juros:num(bjuros.value),multa:num(bmulta.value),desconto:num(bdesconto.value),total,situacao:'EM ABERTO',observacao:bobs.value});
 db.titulos??=[];db.titulos.push({id:id+1,tipo:'RECEBER',pessoa_id:cli?.id||null,pessoa:cli?.nome||'',documento:codigo,emissao:bemissao.value,vencimento:bvenc.value,valor:total,valor_baixado:0,status:'ABERTO',plano_conta:'Boletos a receber',banco:bk?.nome||'',historico:'Boleto '+codigo});save();show('boletos');
}
function baixarBoleto(id){
 const b=(db.boletos||[]).find(x=>x.id===id);if(!b)return;if(!b.banco){alert('Defina uma Conta Financeira no boleto antes da baixa.');return}b.situacao='BAIXADO';b.data_baixa=today();
 const t=(db.titulos||[]).find(x=>x.documento===b.codigo&&x.tipo==='RECEBER');if(t){t.valor_baixado=num(t.valor);t.status='BAIXADO';t.data_baixa=today()}
 db.caixa_receitas??=[];db.caixa_receitas.push({id:Date.now(),data:today(),categoria:'BOLETO',descricao:'Baixa boleto '+b.codigo,banco:b.banco||'',valor:num(b.total||b.valor)});movConta(b.banco,'CRÉDITO',num(b.total||b.valor),'Baixa boleto '+b.codigo,b.codigo);save();show('boletos');
}
function drawBoletos(){
 const q=(bq?.value||'').toLowerCase(),a=(db.boletos||[]).filter(x=>JSON.stringify(x).toLowerCase().includes(q)).slice().reverse();
 blista.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Código</th><th>Cliente</th><th>Conta</th><th>Vencimento</th><th>Total</th><th>Situação</th><th>Ação</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.cliente)}</td><td>${esc(x.banco||'')}</td><td>${esc(x.vencimento)}</td><td>${brl(x.total??x.valor)}</td><td>${esc(x.situacao)}</td><td>${x.situacao==='BAIXADO'?'—':`<button class=mini onclick="baixarBoleto(${x.id})">Dar baixa</button>`}</td></tr>`).join('')}</tbody></table></div>`;
}

function fiado(m){
 const clientes=(db.clientes||[]).map(x=>`<option value="${x.id}">${esc((x.codigo_externo||x.id)+' - '+(x.nome||''))}</option>`).join('');
 const contas=(db.bancos||[]).filter(x=>String(x.ativo)!=='0').map(x=>`<option value="${x.id}">${esc(x.nome||'')}</option>`).join('');
 m.innerHTML=`<h2>Controle de Fiado</h2><div class=card><div class=grid>
 <label>Cliente<select id=fcliente><option value="">Selecione</option>${clientes}</select></label><label>Data<input id=fdata type=date value="${today()}"></label>
 <label>Tipo<select id=ftipo><option>DÉBITO</option><option>CRÉDITO</option></select></label><label>Conta Financeira (obrigatória no CRÉDITO)<select id=fconta><option value="">Selecione</option>${contas}</select></label>
 <label>Descrição<input id=fdesc></label><label>Valor<input id=fvalor type=number step=.01></label>
 </div><div class=toolbar><button class=action onclick="salvarFiado()">SALVAR MOVIMENTO</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div></div>
 <div class=toolbar><select id=filtroCliente><option value="">Todos os clientes</option>${clientes}</select></div><div id=flista></div>`;filtroCliente.onchange=drawFiado;drawFiado();
}
function salvarFiado(){
 if(!fcliente.value||num(fvalor.value)<=0){alert('Selecione o cliente e informe o valor.');return}const cli=(db.clientes||[]).find(x=>String(x.id)===String(fcliente.value));const conta=(db.bancos||[]).find(x=>String(x.id)===String(fconta.value));
 if(ftipo.value==='CRÉDITO'&&!conta){alert('Selecione a Conta Financeira que recebeu o pagamento.');return}
 db.fiado??=[];const r={id:Date.now(),cliente_id:cli?.id||null,cliente:cli?.nome||'',data:fdata.value,tipo:ftipo.value,conta:conta?.nome||'',descricao:fdesc.value,valor:num(fvalor.value)};db.fiado.push(r);
 if(r.tipo==='CRÉDITO'){db.caixa_receitas??=[];db.caixa_receitas.push({id:Date.now()+1,data:r.data,categoria:'FIADO',descricao:'Recebimento fiado - '+r.cliente,banco:r.conta,valor:r.valor});movConta(r.conta,'CRÉDITO',r.valor,'Recebimento fiado - '+r.cliente,'FIADO')}
 save();show('fiado');
}
function drawFiado(){
 const cid=filtroCliente?.value||'',a=(db.fiado||[]).filter(x=>!cid||String(x.cliente_id)===String(cid)).slice().reverse();const saldo=a.reduce((s,x)=>s+(String(x.tipo).toUpperCase()==='DÉBITO'?num(x.valor):-num(x.valor)),0);
 flista.innerHTML=`<div class=card style="margin-bottom:10px"><small>Saldo em aberto</small><strong>${brl(saldo)}</strong></div><div class=tablewrap><table class=tbl><thead><tr><th>Data</th><th>Cliente</th><th>Tipo</th><th>Conta</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.data)}</td><td>${esc(x.cliente||'')}</td><td>${esc(x.tipo)}</td><td>${esc(x.conta||'')}</td><td>${esc(x.descricao)}</td><td>${brl(x.valor)}</td></tr>`).join('')}</tbody></table></div>`;
}

function contasFinanceiras(m){
 const a=db.bancos||[];
 m.innerHTML=`<h2>Contas Financeiras</h2>
 <div class=card><div class=grid>
 <label>Nome da conta<input id=cnome></label><label>Tipo<select id=ctipo><option>Caixa</option><option>Banco</option><option>Carteira</option></select></label>
 <label>Agência<input id=cagencia></label><label>Conta<input id=cconta></label><label>Saldo inicial<input id=csaldo type=number step=.01></label>
 </div><div class=toolbar><button class=action onclick="salvarConta()">NOVA CONTA</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR CADASTRO</button></div></div>
 <h3>Contas cadastradas</h3><div id=contaslista></div>
 <h3>Extrato da conta</h3><div class=toolbar><select id=extratoConta onchange="drawExtrato()"><option value="">Selecione a conta</option>${a.map(x=>`<option value="${x.id}">${esc(x.nome)}</option>`).join('')}</select><button class="action gold" onclick="ccPrint()">PDF EXTRATO</button></div><div id=extratolista></div>`;
 drawContas();drawExtrato();
}
function salvarConta(){
 if(!cnome.value.trim()){alert('Informe o nome da conta.');return}
 const arr=db.bancos||[];const id=nextId(arr);
 arr.push({id,nome:cnome.value.trim(),tipo:ctipo.value,agencia:cagencia.value,conta:cconta.value,saldo_inicial:num(csaldo.value),saldo:num(csaldo.value),ativo:1});
 db.bancos=arr;save();show('bancos');
}
function drawContas(){
 const a=db.bancos||[];
 contaslista.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Nome</th><th>Tipo</th><th>Agência</th><th>Conta</th><th>Saldo</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.nome)}</td><td>${esc(x.tipo)}</td><td>${esc(x.agencia)}</td><td>${esc(x.conta)}</td><td>${brl(x.saldo)}</td></tr>`).join('')}</tbody></table></div>`;
}
function movConta(contaNome,tipo,valor,descricao,documento='',dataMov=''){
 if(!contaNome)return false;
 const c=(db.bancos||[]).find(x=>x.nome===contaNome);if(!c)return false;
 db.conta_movimentos??=[];const sinal=tipo==='CRÉDITO'?1:-1;c.saldo=num(c.saldo)+(sinal*num(valor));
 db.conta_movimentos.push({id:Date.now()+Math.random(),conta_id:c.id,conta:c.nome,data:dataMov||today(),tipo,valor:num(valor),descricao,documento});return true;
}
function drawExtrato(){
 const id=String(document.querySelector('#extratoConta')?.value||'');
 const c=(db.bancos||[]).find(x=>String(x.id)===id);
 if(!c){extratolista.innerHTML='<div class=card>Selecione uma conta para visualizar o extrato.</div>';return}
 const mov=(db.conta_movimentos||[]).filter(x=>String(x.conta_id)===id).slice().reverse();
 extratolista.innerHTML=`<div class=card><small>Saldo atual</small><strong>${brl(c.saldo)}</strong></div><div class=tablewrap><table class=tbl><thead><tr><th>Data</th><th>Tipo</th><th>Documento</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${mov.map(x=>`<tr><td>${esc(x.data)}</td><td>${esc(x.tipo)}</td><td>${esc(x.documento)}</td><td>${esc(x.descricao)}</td><td>${brl(x.valor)}</td></tr>`).join('')}</tbody></table></div>`;
}

function cheques(m){
 const clientes=(db.clientes||[]).map(x=>`<option value="${x.id}">${esc((x.codigo_externo||x.id)+' - '+(x.nome||''))}</option>`).join('');
 const bancos=(db.bancos||[]).map(x=>`<option value="${x.id}">${esc(x.nome||'')}</option>`).join('');
 m.innerHTML=`<h2>Controle de Cheques</h2><div class=card><div class=grid>
 <label>Cliente / Participante<select id=chcliente><option value="">Selecione</option>${clientes}</select></label>
 <label>Nº do cheque<input id=chnumero></label><label>Banco<input id=chbanco></label>
 <label>Emissão<input id=chemissao type=date value="${today()}"></label><label>Vencimento<input id=chvenc type=date></label>
 <label>Valor<input id=chvalor type=number step=.01></label><label>Conta de destino<select id=chconta><option value="">Selecione</option>${bancos}</select></label>
 <label>Observação<input id=chobs></label></div>
 <div class=toolbar><button class=action onclick="salvarCheque()">SALVAR CHEQUE</button><button class="action gold" onclick="ccPrint()">PDF GERAL</button></div></div>
 <div class=toolbar><input id=chq placeholder="Pesquisar cheque..." style="max-width:320px;margin:0"></div><div id=chlista></div>`;
 chq.oninput=drawCheques;drawCheques();
}
function salvarCheque(){
 if(!chcliente.value||!chvenc.value||num(chvalor.value)<=0){alert('Preencha cliente, vencimento e valor.');return}
 const cli=(db.clientes||[]).find(x=>String(x.id)===String(chcliente.value));
 const conta=(db.bancos||[]).find(x=>String(x.id)===String(chconta.value));
 const id=Date.now(),doc=chnumero.value.trim()||('CH'+String(id).slice(-8));
 db.cheques??=[];db.cheques.push({id,cliente_id:cli?.id||null,cliente:cli?.nome||'',numero:doc,banco:chbanco.value,emissao:chemissao.value,vencimento:chvenc.value,valor:num(chvalor.value),conta:conta?.nome||'',situacao:'EM ABERTO',observacao:chobs.value});
 db.titulos??=[];db.titulos.push({id:id+1,tipo:'RECEBER',pessoa_id:cli?.id||null,pessoa:cli?.nome||'',documento:doc,emissao:chemissao.value,vencimento:chvenc.value,valor:num(chvalor.value),valor_baixado:0,status:'ABERTO',plano_conta:'Cheques a receber',banco:conta?.nome||'',historico:'Cheque '+doc});
 save();show('cheques');
}
function baixarCheque(id){
 const ch=(db.cheques||[]).find(x=>x.id===id);if(!ch)return;
 ch.situacao='COMPENSADO';ch.data_baixa=today();
 const t=(db.titulos||[]).find(x=>x.documento===ch.numero&&x.tipo==='RECEBER');if(t){t.valor_baixado=num(t.valor);t.status='BAIXADO'}
 db.caixa_receitas??=[];db.caixa_receitas.push({id:Date.now(),data:today(),categoria:'CHEQUE',descricao:'Compensação cheque '+ch.numero,banco:ch.conta||'',valor:num(ch.valor)});
 movConta(ch.conta,'CRÉDITO',ch.valor,'Compensação cheque '+ch.numero,ch.numero);
 save();show('cheques');
}
function drawCheques(){
 const q=(chq?.value||'').toLowerCase(),a=(db.cheques||[]).filter(x=>JSON.stringify(x).toLowerCase().includes(q)).slice().reverse();
 chlista.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Nº</th><th>Cliente</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th>Ações</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.numero)}</td><td>${esc(x.cliente)}</td><td>${esc(x.vencimento)}</td><td>${brl(x.valor)}</td><td>${esc(x.situacao)}</td><td>${x.situacao==='COMPENSADO'?'—':`<button class=mini onclick="baixarCheque(${x.id})">Compensar</button>`} <button class=mini onclick="pdfCheque(${x.id})">PDF individual</button></td></tr>`).join('')}</tbody></table></div>`;
}
function pdfCheque(id){
 const ch=(db.cheques||[]).find(x=>x.id===id);if(!ch)return;
 const html=`<html><head><meta charset="utf-8"><title>Cheque ${esc(ch.numero)}</title></head><body><h2>CONTA CERTA - CHEQUE</h2><p><b>Cliente:</b> ${esc(ch.cliente)}</p><p><b>Número:</b> ${esc(ch.numero)}</p><p><b>Banco:</b> ${esc(ch.banco)}</p><p><b>Emissão:</b> ${esc(ch.emissao)}</p><p><b>Vencimento:</b> ${esc(ch.vencimento)}</p><p><b>Valor:</b> ${brl(ch.valor)}</p><p><b>Situação:</b> ${esc(ch.situacao)}</p></body></html>`;
 if(window.Android&&Android.printHtml){Android.printHtml(html,'Cheque '+ch.numero);return;}
 const w=window.open('','_blank');w.document.write(html+'<script>window.print()<\/script>');w.document.close();
}

function jurosCheques(m){
 const cheques=(db.cheques||[]).map(x=>`<option value="${x.id}">${esc(x.numero+' - '+x.cliente+' - '+brl(x.valor))}</option>`).join('');
 m.innerHTML=`<h2>Juros de Cheques</h2><div class=card><div class=grid>
 <label>Cheque<select id=jcheque><option value="">Selecione</option>${cheques}</select></label>
 <label>Início dos juros<input id=jinicio type=date value="${today()}"></label><label>Final dos juros<input id=jfinal type=date value="${today()}"></label>
 <label>Taxa % ao mês<input id=jtaxa type=number step=.01></label></div>
 <div class=toolbar><button class=action onclick="calcularJuros()">CALCULAR E ADICIONAR</button><button class="action gold" onclick="ccPrint()">PDF</button></div></div><div id=jlista></div>`;
 drawJuros();
}
function calcularJuros(){
 const ch=(db.cheques||[]).find(x=>String(x.id)===String(jcheque.value));if(!ch){alert('Selecione o cheque.');return}
 const ini=new Date(jinicio.value),fim=new Date(jfinal.value);if(isNaN(ini)||isNaN(fim)||fim<ini){alert('Datas inválidas.');return}
 const dias=Math.max(0,Math.ceil((fim-ini)/86400000)),taxa=num(jtaxa.value),juros=num(ch.valor)*(taxa/100)*(dias/30);
 db.juros_cheques??=[];db.juros_cheques.push({id:Date.now(),cheque_id:ch.id,cliente:ch.cliente,documento:ch.numero,inicio:jinicio.value,final:jfinal.value,dias,valor:ch.valor,taxa,juros,total:num(ch.valor)+juros});
 db.caixa_receitas??=[];db.caixa_receitas.push({id:Date.now()+1,data:today(),categoria:'JUROS DE CHEQUES',descricao:'Juros cheque '+ch.numero,banco:ch.conta||'',valor:juros});
 movConta(ch.conta,'CRÉDITO',juros,'Juros cheque '+ch.numero,ch.numero);
 save();show('juros_cheques');
}
function drawJuros(){
 const a=(db.juros_cheques||[]).slice().reverse();
 jlista.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Cliente</th><th>Cheque</th><th>Dias</th><th>Taxa</th><th>Juros</th><th>Total</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.cliente)}</td><td>${esc(x.documento)}</td><td>${x.dias}</td><td>${x.taxa}%</td><td>${brl(x.juros)}</td><td>${brl(x.total)}</td></tr>`).join('')}</tbody></table></div>`;
}

function descontoJuros(m){
 const cheques=(db.cheques||[]).map(x=>`<option value="${x.id}">${esc(x.numero+' - '+x.cliente+' - '+brl(x.valor))}</option>`).join('');
 m.innerHTML=`<h2>Desconto de Juros de Cheques</h2><div class=card><div class=grid>
 <label>Cheque<select id=dcheque><option value="">Selecione</option>${cheques}</select></label>
 <label>Início<input id=dinicio type=date value="${today()}"></label><label>Final<input id=dfinal type=date value="${today()}"></label>
 <label>Taxa % ao mês<input id=dtaxa type=number step=.01></label></div>
 <div class=toolbar><button class=action onclick="calcularDesconto()">CALCULAR E LANÇAR DESPESA</button><button class="action gold" onclick="ccPrint()">PDF</button></div></div><div id=dlista></div>`;
 drawDesconto();
}
function calcularDesconto(){
 const ch=(db.cheques||[]).find(x=>String(x.id)===String(dcheque.value));if(!ch){alert('Selecione o cheque.');return}
 const ini=new Date(dinicio.value),fim=new Date(dfinal.value);if(isNaN(ini)||isNaN(fim)||fim<ini){alert('Datas inválidas.');return}
 const dias=Math.max(0,Math.ceil((fim-ini)/86400000)),taxa=num(dtaxa.value),juros=num(ch.valor)*(taxa/100)*(dias/30);
 db.desconto_juros??=[];db.desconto_juros.push({id:Date.now(),cheque_id:ch.id,cliente:ch.cliente,documento:ch.numero,inicio:dinicio.value,final:dfinal.value,dias,valor:ch.valor,taxa,juros,liquido:num(ch.valor)-juros});
 db.caixa_despesas??=[];db.caixa_despesas.push({id:Date.now()+1,data:today(),categoria:'DESCONTO DE JUROS',descricao:'Desconto cheque '+ch.numero,banco:ch.conta||'',valor:juros});
 movConta(ch.conta,'DÉBITO',juros,'Desconto de juros cheque '+ch.numero,ch.numero);
 save();show('desconto_juros');
}
function drawDesconto(){
 const a=(db.desconto_juros||[]).slice().reverse();
 dlista.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Cliente</th><th>Cheque</th><th>Dias</th><th>Taxa</th><th>Desconto</th><th>Líquido</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.cliente)}</td><td>${esc(x.documento)}</td><td>${x.dias}</td><td>${x.taxa}%</td><td>${brl(x.juros)}</td><td>${brl(x.liquido)}</td></tr>`).join('')}</tbody></table></div>`;
}

/* RELATÓRIOS E TABELAS */
function cols(key){
  const map={plano_contas:['codigo','nome','natureza','grupo','classificacao','ativo'],centros_custo:['codigo','descricao','ativo'],bancos:['nome','tipo','agencia','conta','saldo'],boletos:['codigo','cliente','emissao','vencimento','valor','situacao'],fiado:['id','cliente_id','data','tipo','descricao','valor']};
  return map[key]||Object.keys((db[key]||[])[0]||{}).slice(0,7);
}
function tableModule(m,key,title){
  const arr=db[key]||[],cs=cols(key);
  m.innerHTML=`<h2>${title}</h2><div class=toolbar><input id=q placeholder="Pesquisar..." style="max-width:320px;margin:0"><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div><div id=tb></div>`;
  const draw=()=>{const qq=(q.value||'').toLowerCase(),a=arr.filter(x=>JSON.stringify(x).toLowerCase().includes(qq));tb.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr>${cs.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${a.map(x=>`<tr>${cs.map(c=>`<td>${esc(x[c])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`};draw();q.oninput=draw;
}

function periodoHTML(prefix){
  return `<div class=toolbar><label>Data inicial<input id="${prefix}ini" type=date value="${today().slice(0,8)+'01'}"></label><label>Data final<input id="${prefix}fim" type=date value="${today()}"></label><button class=action onclick="${prefix}Gerar()">GERAR</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div>`;
}
function entreDatas(d,ini,fim){return (!ini||d>=ini)&&(!fim||d<=fim);}
function naturezaConta(nome){
  const n=String(nome||'').toLowerCase();
  const pc=(db.plano_contas||[]).find(x=>String(x.nome||'').toLowerCase()===n);
  return pc?.natureza||'';
}

function dre(m){
  m.innerHTML=`<h2>DRE - Demonstração do Resultado</h2><div class=card>${periodoHTML('dre')}</div><div id=dreres></div>`;
  dreGerar();
}
function dreGerar(){
  const ini=document.querySelector('#dreini')?.value||'',fim=document.querySelector('#drefim')?.value||'';
  const receitasCx=(db.caixa_receitas||[]).filter(x=>entreDatas(x.data,ini,fim)).reduce((s,x)=>s+num(x.valor),0);
  const despesasCx=(db.caixa_despesas||[]).filter(x=>entreDatas(x.data,ini,fim)).reduce((s,x)=>s+num(x.valor),0);
  const vendas=(db.vendas||[]).filter(x=>entreDatas(x.data,ini,fim)).reduce((s,x)=>s+num(x.total),0);
  const cmv=(db.vendas||[]).filter(x=>entreDatas(x.data,ini,fim)).reduce((s,v)=>s+(v.itens||[]).reduce((a,i)=>{
    const p=(db.produtos||[]).find(x=>x.id===i.produto_id); return a+(num(p?.custo)*num(i.qtd));
  },0),0);
  const receitaBruta=Math.max(receitasCx,vendas);
  const resultadoBruto=receitaBruta-cmv;
  const resultado=resultadoBruto-despesasCx;
  dreres.innerHTML=`<div class=card><table class=tbl>
  <tr><th>Descrição</th><th>Valor</th></tr>
  <tr><td>Receita Bruta / Receitas</td><td>${brl(receitaBruta)}</td></tr>
  <tr><td>(-) CMV estimado</td><td>${brl(cmv)}</td></tr>
  <tr><td>Resultado Bruto</td><td>${brl(resultadoBruto)}</td></tr>
  <tr><td>(-) Despesas</td><td>${brl(despesasCx)}</td></tr>
  <tr><td><b>Resultado do Período</b></td><td><b>${brl(resultado)}</b></td></tr>
  </table><p><small>Relatório gerencial com base nos lançamentos do Conta Certa. Classificação contábil depende do plano de contas cadastrado.</small></p></div>`;
}

function livroCaixa(m){
  m.innerHTML=`<h2>Livro Caixa</h2><div class=card>${periodoHTML('lc')}</div><div id=lcres></div>`;lcGerar();
}
function lcGerar(){
  const ini=lcini?.value||'',fim=lcfim?.value||'';
  const rec=(db.caixa_receitas||[]).filter(x=>entreDatas(x.data,ini,fim)).map(x=>({...x,entrada:num(x.valor),saida:0}));
  const desp=(db.caixa_despesas||[]).filter(x=>entreDatas(x.data,ini,fim)).map(x=>({...x,entrada:0,saida:num(x.valor)}));
  const mov=[...rec,...desp].sort((a,b)=>String(a.data).localeCompare(String(b.data)));
  let saldo=0;
  lcres.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Data</th><th>Histórico</th><th>Entrada</th><th>Saída</th><th>Saldo</th></tr></thead><tbody>${mov.map(x=>{saldo+=x.entrada-x.saida;return `<tr><td>${esc(x.data)}</td><td>${esc(x.descricao||x.categoria||'')}</td><td>${x.entrada?brl(x.entrada):''}</td><td>${x.saida?brl(x.saida):''}</td><td>${brl(saldo)}</td></tr>`}).join('')}</tbody></table></div>`;
}

function livroDiario(m){
  m.innerHTML=`<h2>Livro Diário</h2><div class=card>${periodoHTML('ld')}</div><div id=ldres></div>`;ldGerar();
}
function ldGerar(){
  const ini=ldini?.value||'',fim=ldfim?.value||'';
  const rows=[];
  (db.titulos||[]).filter(x=>entreDatas(x.emissao||x.vencimento,ini,fim)).forEach(x=>{
    const hist=x.historico||x.documento||'Lançamento';
    if(x.tipo==='RECEBER') rows.push({data:x.emissao||x.vencimento,debito:'Clientes / Contas a Receber',credito:x.plano_conta||'Receitas',valor:num(x.valor),hist});
    else rows.push({data:x.emissao||x.vencimento,debito:x.plano_conta||'Despesas',credito:'Fornecedores / Contas a Pagar',valor:num(x.valor),hist});
  });
  rows.sort((a,b)=>String(a.data).localeCompare(String(b.data)));
  ldres.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Data</th><th>Débito</th><th>Crédito</th><th>Histórico</th><th>Valor</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.data)}</td><td>${esc(x.debito)}</td><td>${esc(x.credito)}</td><td>${esc(x.hist)}</td><td>${brl(x.valor)}</td></tr>`).join('')}</tbody></table></div>`;
}

function livroRazao(m){
  const contas=(db.plano_contas||[]).map(x=>`<option value="${esc(x.nome)}">${esc((x.codigo||'')+' - '+(x.nome||''))}</option>`).join('');
  m.innerHTML=`<h2>Livro Razão</h2><div class=card><div class=grid><label>Conta<select id=rzconta><option value="">Todas</option>${contas}</select></label><label>Data inicial<input id=rzini type=date value="${today().slice(0,8)+'01'}"></label><label>Data final<input id=rzfim type=date value="${today()}"></label></div><div class=toolbar><button class=action onclick="rzGerar()">GERAR</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div></div><div id=rzres></div>`;
  rzGerar();
}
function rzGerar(){
  const conta=rzconta?.value||'',ini=rzini?.value||'',fim=rzfim?.value||'';
  const rows=[];
  (db.titulos||[]).filter(x=>entreDatas(x.emissao||x.vencimento,ini,fim)).forEach(x=>{
    const c=x.plano_conta|| (x.tipo==='RECEBER'?'Receitas':'Despesas');
    if(!conta||c===conta) rows.push({data:x.emissao||x.vencimento,conta:c,debito:x.tipo==='PAGAR'?num(x.valor):0,credito:x.tipo==='RECEBER'?num(x.valor):0,hist:x.historico||x.documento||''});
  });
  let saldo=0;
  rzres.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Data</th><th>Conta</th><th>Histórico</th><th>Débito</th><th>Crédito</th><th>Saldo</th></tr></thead><tbody>${rows.map(x=>{saldo+=x.debito-x.credito;return `<tr><td>${esc(x.data)}</td><td>${esc(x.conta)}</td><td>${esc(x.hist)}</td><td>${x.debito?brl(x.debito):''}</td><td>${x.credito?brl(x.credito):''}</td><td>${brl(saldo)}</td></tr>`}).join('')}</tbody></table></div>`;
}

function balancete(m){
  m.innerHTML=`<h2>Balancete</h2><div class=card>${periodoHTML('bal')}</div><div id=balres></div>`;balGerar();
}
function balGerar(){
  const ini=balini?.value||'',fim=balfim?.value||'',map={};
  (db.titulos||[]).filter(x=>entreDatas(x.emissao||x.vencimento,ini,fim)).forEach(x=>{
    const c=x.plano_conta|| (x.tipo==='RECEBER'?'Receitas':'Despesas');map[c]=map[c]||{deb:0,cred:0};
    if(x.tipo==='PAGAR')map[c].deb+=num(x.valor);else map[c].cred+=num(x.valor);
  });
  const rows=Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]));
  const td=rows.reduce((s,[,v])=>s+v.deb,0),tc=rows.reduce((s,[,v])=>s+v.cred,0);
  balres.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Conta</th><th>Débitos</th><th>Créditos</th><th>Saldo</th></tr></thead><tbody>${rows.map(([c,v])=>`<tr><td>${esc(c)}</td><td>${brl(v.deb)}</td><td>${brl(v.cred)}</td><td>${brl(v.deb-v.cred)}</td></tr>`).join('')}<tr><th>TOTAIS</th><th>${brl(td)}</th><th>${brl(tc)}</th><th>${brl(td-tc)}</th></tr></tbody></table></div>`;
}

function estoqueExtrato(m){
  const prods=(db.produtos||[]).map(x=>`<option value="${x.id}">${esc((x.codigo||'')+' - '+(x.descricao||''))}</option>`).join('');
  m.innerHTML=`<h2>Extrato de Estoque</h2><div class=card><div class=grid><label>Produto<select id=exprod><option value="">Todos</option>${prods}</select></label><label>Data inicial<input id=exini type=date value="${today().slice(0,8)+'01'}"></label><label>Data final<input id=exfim type=date value="${today()}"></label></div><div class=toolbar><button class=action onclick="exGerar()">GERAR</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div></div><div id=exres></div>`;
  exGerar();
}
function exGerar(){
  const pid=String(exprod?.value||''),ini=exini?.value||'',fim=exfim?.value||'';
  const produtos=(db.produtos||[]).filter(p=>!pid||String(p.id)===pid);
  const rows=produtos.map(p=>{
    const mov=(db.estoque_movimentos||[]).filter(x=>String(x.produto_id)===String(p.id));
    const anteriores=mov.filter(x=>x.data<ini);
    const periodo=mov.filter(x=>entreDatas(x.data,ini,fim));
    const ant=anteriores.reduce((s,x)=>s+(String(x.tipo).toUpperCase()==='ENTRADA'?num(x.quantidade):-num(x.quantidade)),0);
    const ent=periodo.filter(x=>String(x.tipo).toUpperCase()==='ENTRADA').reduce((s,x)=>s+num(x.quantidade),0);
    const sai=periodo.filter(x=>String(x.tipo).toUpperCase()==='SAIDA').reduce((s,x)=>s+num(x.quantidade),0);
    const final=ant+ent-sai;
    return {codigo:p.codigo,descricao:p.descricao,saldo_anterior:ant,entradas:ent,saidas:sai,saldo_final:final,custo:num(p.custo),valor_final:final*num(p.custo)};
  });
  exres.innerHTML=`<div class=tablewrap><table class=tbl><thead><tr><th>Código</th><th>Produto</th><th>Saldo anterior</th><th>Entradas</th><th>Saídas</th><th>Saldo final</th><th>Custo</th><th>Valor final</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.descricao)}</td><td>${x.saldo_anterior}</td><td>${x.entradas}</td><td>${x.saidas}</td><td>${x.saldo_final}</td><td>${brl(x.custo)}</td><td>${brl(x.valor_final)}</td></tr>`).join('')}</tbody></table></div>`;
}


function inventarioAjuste(m){
  const negativos=(db.produtos||[]).filter(x=>num(x.estoque)<0);
  const prods=(db.produtos||[]).map(x=>`<option value="${x.id}">${esc((x.codigo||'')+' - '+(x.descricao||''))} | atual: ${x.estoque??0}</option>`).join('');
  m.innerHTML=`<h2>Inventário / Ajuste de Estoque</h2>
  <div class=card><p><b>Produtos com saldo negativo:</b> ${negativos.length}</p><p>Informe a quantidade física real do produto. O sistema registra o ajuste no histórico; ele não apaga a movimentação anterior.</p>
  <div class=grid><label>Produto<select id=ajprod><option value="">Selecione</option>${prods}</select></label><label>Quantidade física real<input id=ajqtd type=number step=.001></label><label>Motivo<input id=ajmotivo value="Inventário / correção de saldo"></label></div>
  <div class=toolbar><button class=action onclick="salvarAjusteEstoque()">SALVAR AJUSTE</button><button class="action gold" onclick="ccPrint()">PDF / IMPRIMIR</button></div></div>
  <h3>Produtos negativos</h3><div id=ajneg></div>`;
  drawNegativos();
}
function salvarAjusteEstoque(){
  const p=(db.produtos||[]).find(x=>String(x.id)===String(ajprod.value));
  if(!p){alert('Selecione o produto.');return}
  const fisico=num(ajqtd.value),atual=num(p.estoque),dif=fisico-atual;
  if(!confirm(`Saldo atual: ${atual}. Saldo físico informado: ${fisico}. Ajuste: ${dif}. Confirmar?`))return;
  p.estoque=fisico;
  db.estoque_movimentos??=[];
  if(dif!==0) db.estoque_movimentos.push({
    id:Date.now(),produto_id:p.id,data:today(),
    tipo:dif>0?'ENTRADA':'SAIDA',quantidade:Math.abs(dif),
    origem:'AJUSTE DE INVENTÁRIO',documento:ajmotivo.value||'Inventário'
  });
  save();
  alert('Estoque ajustado e movimentação registrada.');
  show('inventario_ajuste');
}
function drawNegativos(){
  const a=(db.produtos||[]).filter(x=>num(x.estoque)<0).sort((x,y)=>num(x.estoque)-num(y.estoque));
  ajneg.innerHTML=a.length
    ? `<div class=tablewrap><table class=tbl><thead><tr><th>Código</th><th>Produto</th><th>Saldo atual</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.descricao)}</td><td>${x.estoque}</td></tr>`).join('')}</tbody></table></div>`
    : '<div class=card>✅ Nenhum produto com estoque negativo.</div>';
}

function relatorios(m){
 m.innerHTML=`<h2>Relatórios</h2><div class=cards>
 <div class=card><small>Cadastros</small><div class=toolbar><button class=action onclick="show('clientes')">Clientes</button><button class=action onclick="show('fornecedores')">Fornecedores</button><button class=action onclick="show('produtos')">Produtos / Extrato estoque</button></div></div>
 <div class=card><small>Financeiro</small><div class=toolbar><button class=action onclick="show('titulos_pagar')">Contas a Pagar</button><button class=action onclick="show('titulos_receber')">Contas a Receber</button><button class=action onclick="show('caixa_despesas')">Caixa Despesas</button><button class=action onclick="show('caixa_receitas')">Caixa Receitas</button></div></div>
 <div class=card><small>Comercial</small><div class=toolbar><button class=action onclick="show('vendas')">Vendas</button><button class=action onclick="show('boletos')">Boletos</button><button class=action onclick="show('fiado')">Fiado</button><button class=action onclick="show('cheques')">Cheques</button><button class=action onclick="show('bancos')">Contas Financeiras</button></div></div>
 <div class=card><small>Backup</small><div class=toolbar><button class=action onclick="backup()">Exportar backup</button><label class=action style="display:inline-block;cursor:pointer">Restaurar backup<input type=file accept=".json,application/json" style="display:none" onchange="restoreBackup(this.files[0])"></label></div></div>
 <button class=action onclick="show('dre')">DRE</button><button class=action onclick="show('livro_caixa')">Livro Caixa</button><button class=action onclick="show('livro_diario')">Livro Diário</button><button class=action onclick="show('livro_razao')">Livro Razão</button><button class=action onclick="show('balancete')">Balancete</button><button class=action onclick="show('estoque_extrato')">Extrato Estoque</button><button class=action onclick="show('inventario_ajuste')">Inventário / Ajuste</button></div><div class=card style="margin-top:12px"><p>Para gerar PDF, abra o módulo e toque em <b>PDF / IMPRIMIR</b>; depois escolha <b>Salvar como PDF</b>.</p></div>`;
}
function backup(){const nome='backup_conta_certa_'+today()+'.json';const txt=JSON.stringify(db,null,2);if(window.Android&&Android.saveBackup){Android.saveBackup(txt,nome);return;}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=nome;a.click();}
function restoreBackup(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();alert('Backup restaurado com sucesso.');show('dashboard')}catch(e){alert('Backup inválido.')}};r.readAsText(file);}
function auditoria(m){
  const checks=[];const add=(nome,ok,det='')=>checks.push([nome,!!ok,det]);
  add('Clientes',(db.clientes||[]).length>0,`${(db.clientes||[]).length} registros`);add('Fornecedores',(db.fornecedores||[]).length>0,`${(db.fornecedores||[]).length} registros`);add('Produtos',(db.produtos||[]).length>0,`${(db.produtos||[]).length} registros`);
  add('Plano de contas',(db.plano_contas||[]).length>0);add('Centros de custo',(db.centros_custo||[]).length>0);add('Contas financeiras',(db.bancos||[]).length>0);
  let contasOk=true,maiorDif=0;(db.bancos||[]).forEach(c=>{const mov=(db.conta_movimentos||[]).filter(x=>String(x.conta_id)===String(c.id));const esperado=num(c.saldo_inicial)+mov.reduce((s,x)=>s+(x.tipo==='CRÉDITO'?num(x.valor):-num(x.valor)),0);const dif=Math.abs(esperado-num(c.saldo));maiorDif=Math.max(maiorDif,dif);if(dif>.01)contasOk=false;});
  add('Saldos das Contas Financeiras',contasOk,`maior diferença ${brl(maiorDif)}`);
  const titSemConta=(db.titulos||[]).filter(x=>String(x.status||'').toUpperCase()!=='BAIXADO'&&!x.banco).length;add('Títulos abertos com Conta Financeira',titSemConta===0,`${titSemConta} sem conta`);
  const negativos=(db.produtos||[]).filter(x=>num(x.estoque)<0).length;add('Estoque sem saldo negativo',negativos===0,`${negativos} produtos negativos`);
  add('Backup disponível',typeof backup==='function');add('Extrato de produtos disponível',typeof relatorioMovProdutos==='function');
  const ok=checks.filter(x=>x[1]).length,pct=Math.round(ok/checks.length*100);
  m.innerHTML=`<h2>Auditoria Final V9</h2><div class=card><strong>Integridade: ${pct}% (${ok}/${checks.length})</strong><div class=tablewrap><table class=tbl><thead><tr><th>Verificação</th><th>Status</th><th>Detalhe</th></tr></thead><tbody>${checks.map(x=>`<tr><td>${x[0]}</td><td>${x[1]?'✅ OK':'⚠️ ATENÇÃO'}</td><td>${esc(x[2])}</td></tr>`).join('')}</tbody></table></div><div class=toolbar><button class="action gold" onclick="ccPrint()">PDF AUDITORIA</button>${negativos>0?'<button class="action" onclick="show(\'inventario_ajuste\')">CORRIGIR ESTOQUE NEGATIVO</button>':''}</div></div>`;
}
window.onload=boot;
