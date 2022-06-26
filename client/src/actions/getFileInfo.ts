const proxy: String = 'http://localhost:8080';

export default async function getFileInfo(fileId: String | undefined) {
  let res = {};
  await fetch(proxy + '/getFileInfo/' + fileId, 
  { 
    method: 'GET', 
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