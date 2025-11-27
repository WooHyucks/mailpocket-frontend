export interface PostSubscribeType {
  ids: number[];
}

export interface Params {
  in_mail: boolean;
  subscribe_status: string;
  sort_type: string;
  cursor?: string;
  category_id?: number;
}

export interface SummaryItem {
  [key: string]: string;
}

export interface NewsLetterDataType {
  id: number;
  name: string;
  category: string;
  mail: {
    id: number;
    subject: string;
    summary_list: SummaryItem;
    s3_object_key: string;
    newsletter_id: number;
  };
}

export interface NewsletterResponse {
  data: NewsLetterDataType[];
  nextCursor?: string | null;
}




