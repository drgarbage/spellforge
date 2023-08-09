import { useTranslation } from "next-i18next";
import { useUserContext } from "context";
import { Dropdown, Textarea, Row, Col, Input, Divider, Spacer } from '@nextui-org/react';
import OptionsEditor from './options-editor';

export default ({config, onConfigChange}) => {
  const { t } = useTranslation();
  const { preferences, setPreference } = useUserContext();
  const { openai: apiKey, sdapi } = preferences;

  return (
    <>
      <Row>
        <Col>
          <Input 
            size="sm"
            labelLeft={
              <Dropdown>
                <Dropdown.Button auto light>{t(config?.type)}</Dropdown.Button>
                <Dropdown.Menu onAction={(key) => onConfigChange('type', key)}>
                  <Dropdown.Item key="PatternGenerator">{t('PatternGenerator')}</Dropdown.Item>
                  <Dropdown.Item key="OpenAIGenerator">{t('OpenAIGenerator')}</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            }
            aria-label={t('LABEL.GRIMOIRE_NAME')}
            placeholder={t('LABEL.GRIMOIRE_NAME')}
            initialValue={config?.name} 
            onChange={e => onConfigChange('name', e.target.value)}
            />
        </Col>
      </Row>


      { config?.type === "OpenAIGenerator" && <Divider y={2} />}

      {
        config?.type === "OpenAIGenerator" &&
        <Row>
          <Col>
            <Textarea
              helperColor="error"
              helperText={!apiKey && t('ERR.OPENAI_APIKEY_NOT_SET')}
              label={t('LABEL.ASK_GPT')}
              placeholder={t('HINT.ASK_GPT')}
              initialValue={config?.openai}
              onChange={(e) => onConfigChange('openai', e.target.value)}
              width="100%"
            />
            <Spacer y={!apiKey ? 1 : 0} />
            <OptionsEditor
              options={config?.openaiOptions}
              onOptionsChanged={(newOptions) => onConfigChange('openaiOptions', newOptions)}
            />
          </Col>
        </Row>
      }

      <Divider y={2} />

      <Row>
        <Col>
          <Textarea
            helperColor="error"
            helperText={!sdapi && t('ERR.SDAPI_HOST_NOT_SET')}
            label={t('LABEL.TXT2IMG')}
            placeholder={t('HINT.TXT2IMG')}
            initialValue={config?.prompt}
            onChange={(e) => onConfigChange('prompt', e.target.value)}
            width="100%"
          />
          <Spacer y={!sdapi ? 1 : 0} />
          <OptionsEditor
            options={config?.promptOptions}
            onOptionsChanged={(newOptions) => onConfigChange('promptOptions', newOptions)}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Textarea
            label={t('LABEL.COMMENT')}
            placeholder={t('HINT.COMMENT')}
            initialValue={config?.comment}
            onChange={(e) => onConfigChange('comment', e.target.value)}
            width="100%"
          />
          <OptionsEditor
            options={config?.commentOptions}
            onOptionsChanged={(newOptions) => onConfigChange('promptOptions', newOptions)}
          />
        </Col>
      </Row>
    </>
  );
}