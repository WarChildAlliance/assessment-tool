export interface Attachment {
  id: number;
  attachment_type: AttachmentTypeEnum;
  link: string;
}

enum AttachmentTypeEnum {
  Audio = 'AUDIO',
  Image = 'IMAGE'
}
