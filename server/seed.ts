import { passwordHash } from '../app/appAuth';

// Dados criados do zero, sem relação com pessoas ou históricos do sistema original.
export async function seedDemo(db:D1Database) {
  const count=await db.prepare('SELECT COUNT(*) AS count FROM congregations').first<{count:number}>();
  if(count?.count) return;
  const now=new Date().toISOString(),cong='cong-demo';
  await db.prepare('INSERT INTO congregations VALUES (?,?,?,?,?,?)').bind(cong,'Comunidade fictícia de demonstração','Cidade Exemplo','Reunião acadêmica',now,now).run();
  const privileges=['presidente_meio_semana','presidente_reuniao_publica','oracao','tesouros','joias','leitura','iniciando_conversas','cultivando_interesse','fazendo_discipulos','explicando_crencas','discurso','o_que_voce_diria','necessidades_locais','vida_crista','dirigente_estudo_biblico','leitor_estudo_biblico','dirigente_sentinela','leitor_sentinela','dirigente_campo','audio','video','indicador_externo','indicador_interno','microfone_volante'];
  for(let i=1;i<=12;i++) {
    const id=`demo-${String(i).padStart(3,'0')}`,name=`Participante ${String(i).padStart(3,'0')}`,role=i===1?'admin':i===2?'coordenador':'publicador';
    const modules=i===2?'["designacao_vm","reuniao_publica","mecanicas","campo"]':'[]';
    const email=i===1?'admin@example.invalid':i===2?'editor@example.invalid':i===3?'aluno@example.invalid':`participante${i}@example.invalid`;
    await db.prepare('INSERT INTO members (id,congregation_id,name,email,role,active,privileges,editable_modules,source,created_at,updated_at,gender,participation_status,congregation_status,field_availability) VALUES (?,?,?,?,?,1,?,?,?,?,?,?,?,?,?)').bind(id,cong,name,email,role,JSON.stringify(privileges),modules,'ficticio',now,now,i<=6?'masculino':'feminino','ativo',i<=2?'anciao':'publicador_batizado','["seg","ter","qua","qui","sex","sab","dom"]').run();
    if(i<=3)await db.prepare('INSERT INTO invitations (id,congregation_id,member_id,email,role,status,password_hash,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(`demo-login-${i}`,cong,id,email,role,'aceito',passwordHash('DemoAcademica!2026'),now,now).run();
  }
  for(let i=1;i<=3;i++) await db.prepare('INSERT INTO field_service_groups (id,congregation_id,name,created_at,updated_at) VALUES (?,?,?,?,?)').bind(`demo-group-${i}`,cong,`Grupo fictício ${i}`,now,now).run();
  for(let i=1;i<=4;i++) {
    const day=String(3+(i-1)*7).padStart(2,'0'),date=`2026-11-${day}`,week=`demo-week-${i}`;
    const monday=`2026-11-${String(2+(i-1)*7).padStart(2,'0')}`;
    await db.prepare('INSERT INTO weeks VALUES (?,?,?,?,?,?,?,?,?,?)').bind(week,cong,monday,date,'Leitura fictícia','1','2',i===1?'publicada':'rascunho',now,now).run();
    const parts=[['Abertura','meta','Abertura da reunião','oracao',3],['TESOUROS','teal','Apresentação de exemplo','tesouros',10],['MINISTÉRIO','gold','Conversa de demonstração','iniciando_conversas',4],['VIDA CRISTÃ','red','Estudo de exemplo','vida_crista',15]] as const;
    for(const [j,p] of parts.entries())await db.prepare('INSERT INTO assignments VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(`demo-assignment-${i}-${j}`,cong,week,p[0],p[1],j+1,p[2],p[4],p[3],`demo-${String(j+1).padStart(3,'0')}`,j===2?'demo-005':null,i===1?'confirmada':'rascunho',now,now).run();
    await db.prepare('INSERT INTO public_meetings (id,congregation_id,week_id,meeting_date,public_talk_speaker,public_talk_speaker_congregation,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(`demo-public-${i}`,cong,week,`2026-11-${String(7+(i-1)*7).padStart(2,'0')}`,'Orador fictício','Comunidade Exemplo','rascunho',now,now).run();
    await db.prepare('INSERT INTO mechanical_assignments (id,congregation_id,assignment_date,meeting_kind,audio_member_id,video_member_id,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(`demo-mechanical-${i}`,cong,date,'meio_semana','demo-004','demo-005','confirmada',now,now).run();
  }
  for(let i=1;i<=5;i++)await db.prepare('INSERT INTO public_talk_themes VALUES (?,?,?,?,?,?,?)').bind(`demo-theme-${i}`,i,`Tema fictício ${i}`,'ficticio',1,now,now).run();
  await db.prepare('INSERT INTO time_away (id,congregation_id,member_id,start_date,end_date,reason,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind('demo-away',cong,'demo-006','2026-11-10','2026-11-12','Indisponibilidade fictícia','ficticio',now,now).run();
  await db.prepare('INSERT INTO field_ministry_assignments (id,congregation_id,activity_date,weekday,start_time,arrangement,field_service_group_id,conductor_member_id,location,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind('demo-field',cong,'2026-11-07','sab','09:00','grupo_servico','demo-group-1','demo-002','Local fictício','rascunho',now,now).run();
}
