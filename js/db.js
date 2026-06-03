
let db;
const request=indexedDB.open("OptiLogDB",1);

request.onupgradeneeded=(e)=>{
 const db=e.target.result;

 if(!db.objectStoreNames.contains("incidents")){
   db.createObjectStore("incidents",{keyPath:"id",autoIncrement:true});
 }

 if(!db.objectStoreNames.contains("photos")){
   const store=db.createObjectStore("photos",{keyPath:"id",autoIncrement:true});
   store.createIndex("incidentId","incidentId");
 }
};

request.onsuccess=(e)=>{
 db=e.target.result;
 loadIncidents();
};

request.onerror=(e)=>{
 console.error("DB Error",e);
};
