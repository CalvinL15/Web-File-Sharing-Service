export default async function uploadFile(file: File) {
  const formData = new FormData();
  let res = {};
  formData.append('file', file);
  await fetch('/uploadFile', 
  { 
    method: 'POST', 
    body: formData, 
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