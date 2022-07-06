export default async function uploadFiles(file: File[]) {
  const formData = new FormData();
  let res = {};
  for(let i = 0; i<file.length; i++){
    formData.append(`file_${i+1}`, file[i]);
  }
  await fetch('/uploadFiles', 
  { method: 'POST', body: formData })
  .then(response => response.json())
  .then(result => {
    res = result;
    console.log(res);
  })
  .catch(error => {
    console.error('Error:', error);
  });
  console.log(res);
  return res;
}