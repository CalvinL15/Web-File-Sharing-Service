export default async function createRequest(fileId: string | undefined, fileName: string, requestType: number, reason: string) {
  let res = {};
  const formData = new FormData();
  if(fileId === undefined) return;
  formData.append('fileId', fileId);
  formData.append('fileName', fileName);
  formData.append('requestType', requestType.toString());
  formData.append('reason', reason);
  await fetch('/createRequest/', 
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