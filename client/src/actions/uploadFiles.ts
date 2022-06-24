const proxy: String = 'http://localhost:8080'

export default async function uploadFiles(file: File[]) {
  // let res = await fetch(proxy + '/', { method: 'GET' })
  //   .then((res) => res.json()).then((data) => console.log(data));
  // return res;
  const formData = new FormData();
  for(let i = 0; i<file.length; i++){
    formData.append(`file_${i+1}`, file[i]);
  }
  let res = await fetch(proxy + '/uploadFiles', 
  { method: 'POST', body: formData })
  .then(response => response.json())
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
  return res;
}