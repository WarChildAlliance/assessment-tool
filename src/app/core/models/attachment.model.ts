export interface Attachment {
  id: number;
  attachment_type: AttachmentTypeEnum;
  file: string;
}

enum AttachmentTypeEnum {
  Audio = 'AUDIO',
  Image = 'IMAGE'
}
