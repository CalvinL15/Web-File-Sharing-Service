export default interface IFile {
  file_id: string,
  file_name: string,
  file_data: Buffer,
  file_size: number,
  file_type: string,
  is_file_blocked: boolean,
  file_upload_time: Date,
  last_download_time: Date,
}
