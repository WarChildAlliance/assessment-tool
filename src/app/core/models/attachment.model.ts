export interface Attachment {
  id: number;
  attachment_type: AttachmentTypeEnum;
  file: string;
  background_image: boolean;
}

enum AttachmentTypeEnum {
  Audio = 'AUDIO',
  Image = 'IMAGE'
}
