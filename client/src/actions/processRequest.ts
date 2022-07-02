export default async function processRequest(requestId: string, requestType: number, decision: string, fileId: string) {
  let res = {};
  const formData = new FormData();
  formData.append('requestType', requestType.toString());
  formData.append('decision', decision);
  formData.append('fileId', fileId);
  await fetch('/processRequest/' + requestId, 
  { 
    method: 'POST', 
    body: formData
  })
  .then(response => response.json())
  .then(result => {
    res = result;
  })
  .catch(error => {
    console.error('Error:', error);
  });
  return res;
}