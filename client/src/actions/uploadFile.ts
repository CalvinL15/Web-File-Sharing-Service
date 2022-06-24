const proxy: String = 'http://localhost:8080'

export default async function uploadFile(file: File) {
  const formData = new FormData();
  let res = {};
  formData.append('name', 'upload');
  formData.append('filename', file.name);
  formData.append('file', file);
  await fetch(proxy + '/uploadFile', 
  { 
    method: 'POST', 
    body: formData, 
    // headers: { "Content-Type": "multipart/form-data" } 
  })
  .then(response => response.json())
  .then(result => {
    console.log('Success:', result);
    res = result;
  })
  .catch(error => {
    console.error('Error:', error);
  });
  return res;
}