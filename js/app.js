
let editId=null;

saveBtn.onclick=saveIncident;
search.oninput=loadIncidents;

function saveIncident(){

 if(!db){
   alert("Databáze ještě není připravena.");
   return;
 }

 const incident={
   part:part.value,
   order:order.value,
   machine:machine.value,
   status:status.value,
   note:note.value,
   created:new Date().toLocaleString()
 };

 const tx=db.transaction(["incidents"],"readwrite");
 const store=tx.objectStore("incidents");

 if(editId) incident.id=editId;

 const req=store.put(incident);

 req.onsuccess=(e)=>{

   const incidentId=editId || e.target.result;

   const files=[...photos.files];

   if(files.length){
      const ptx=db.transaction(["photos"],"readwrite");
      const pstore=ptx.objectStore("photos");

      files.forEach(file=>{
         pstore.add({
           incidentId:incidentId,
           blob:file,
           name:file.name
         });
      });
   }

   editId=null;

   part.value='';
   order.value='';
   note.value='';
   photos.value='';

   loadIncidents();
 };
}

function loadIncidents(){

 if(!db) return;

 const historyDiv=document.getElementById("historyList");
 historyDiv.innerHTML='';

 const filter=search.value.toLowerCase();

 const tx=db.transaction(["incidents"],"readonly");
 const store=tx.objectStore("incidents");

 store.getAll().onsuccess=(e)=>{

   const records=e.target.result.reverse();

   records
   .filter(r=>JSON.stringify(r).toLowerCase().includes(filter))
   .forEach(r=>{

      const div=document.createElement("div");
      div.className="card";

      div.innerHTML=`
      <b>${r.part || ''}</b> | ${r.machine || ''} | ${r.status || ''}<br>
      Zakázka: ${r.order || ''}<br>
      ${r.note || ''}<br>
      <button onclick="editIncident(${r.id})">Edit</button>
      `;

      historyDiv.appendChild(div);

      loadPhotos(r.id,div);
   });
 };
}

function loadPhotos(incidentId,parent){

 const tx=db.transaction(["photos"],"readonly");
 const index=tx.objectStore("photos").index("incidentId");

 index.getAll(incidentId).onsuccess=(e)=>{

   e.target.result.forEach(photo=>{

      const img=document.createElement("img");
      img.className="thumb";

      const url=URL.createObjectURL(photo.blob);

      img.src=url;

      img.onclick=()=>window.open(url,"_blank");

      parent.appendChild(img);
   });
 };
}

function editIncident(id){

 const tx=db.transaction(["incidents"],"readonly");

 tx.objectStore("incidents").get(id).onsuccess=(e)=>{

   const r=e.target.result;

   editId=id;

   part.value=r.part || '';
   order.value=r.order || '';
   machine.value=r.machine || '';
   status.value=r.status || 'Otevřený';
   note.value=r.note || '';
   window.scrollTo(0,0);
 };
}
