// ConfigEditor.js
import { Dropdown, Textarea, Row, Col, Input } from '@nextui-org/react';
import OptionsEditor from './options-editor';

const strings = {
  "PatternGenerator": "套版提示詞",
  "OpenAIGenerator": "GPT提示詞"
}

export default ({config, onConfigChange}) => 
  <>
    <Row>
      <Col>
        <Input 
          size="sm"
          labelLeft={
            <Dropdown>
              <Dropdown.Button auto light>{strings[config?.type]}</Dropdown.Button>
              <Dropdown.Menu onAction={(key) => onConfigChange('type', key)}>
                <Dropdown.Item key="PatternGenerator">{strings["PatternGenerator"]}</Dropdown.Item>
                <Dropdown.Item key="OpenAIGenerator">{strings["OpenAIGenerator"]}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          }
          aria-label="樣板名稱"
          placeholder="設置樣板名稱"
          initialValue={config?.name} 
          onChange={e => onConfigChange('name', e.target.value)}
          />
      </Col>
    </Row>

    {
      config?.type === "OpenAIGenerator" &&
      <Row>
        <Col>
          <Textarea
            label='Ask ChatGPT'
            placeholder="openai"
            initialValue={config?.openai}
            onChange={(e) => onConfigChange('openai', e.target.value)}
            width="100%"
          />
          <OptionsEditor
            options={config?.openaiOptions}
            onOptionsChanged={(newOptions) => onConfigChange('openaiOptions', newOptions)}
          />
        </Col>
      </Row>
    }

    <Row>
      <Col>
        <Textarea
          label='txt2img'
          placeholder="prompt"
          initialValue={config?.prompt}
          onChange={(e) => onConfigChange('prompt', e.target.value)}
          width="100%"
        />
        <OptionsEditor
          options={config?.promptOptions}
          onOptionsChanged={(newOptions) => onConfigChange('promptOptions', newOptions)}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Textarea
          label="相片備註"
          placeholder="comment"
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