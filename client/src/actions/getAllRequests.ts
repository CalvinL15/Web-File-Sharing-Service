export default async function getAllRequests() {
  let res = {};
  await fetch('/getAllRequests', 
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