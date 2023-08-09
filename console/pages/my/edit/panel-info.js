import { Textarea, Col } from '@nextui-org/react';
import { useTranslation } from "next-i18next";

export default ({post}) => {
  const { t } = useTranslation();

  return (
    <Col>
      <Textarea
        label={t('LABEL.INFO_COMMENT')}
        initialValue={post?.comment}
        width="100%"
        />
      <Textarea
        label={t('LABEL.INFO_PROMPT_TO_TXT2IMG')}
        initialValue={post?.prompt}
        width="100%"
        />
      <Textarea
        label={t('LABEL.INFO_PROMPT_TO_GPT')}
        initialValue={post?.background}
        width="100%"
        />
    </Col>
  );
}