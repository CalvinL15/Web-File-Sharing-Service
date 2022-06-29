export default async function updateLastDownloadDate(fileId: String | undefined, downloadTime: string) {
  let res = {};
  const formData = new FormData();
  formData.append("downloadTime", downloadTime);
  await fetch('/updateLastDownloadDate/' + fileId, 
  { 
    method: 'PUT',
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