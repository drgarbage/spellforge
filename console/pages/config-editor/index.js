// ConfigEditor.js
import React, { useState } from 'react';
import { Card, Dropdown, Textarea, Button, Row, Col, Grid, Text } from '@nextui-org/react';
import OptionsEditor from './options-editor';

const ConfigEditor = () => {
  const [config, setConfig] = useState({
    type: 'OpenAIGenerator',
    photos: [],
    openai: 'Ask gpt3 to generate prompt and comment...',
    openaiOptions: {},
    prompt: '[openai]',
    promptOptions: {},
    comment: '[openai]',
    commentOptions: {},
  });

  const handleConfigChange = (key, value) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  const handleOptionsChange = (key, newOptions) => {
    handleConfigChange(key, newOptions);
  };

  // Add your logic to handle options, photos, and other functionalities

  return (
    <Grid.Container gap={2}>
      <Grid xs={24} sm={12}>
        <Card>
          <Card.Body>
            <Row>
              <Col>
                <Text>Type:</Text>
                <Dropdown>
                  <Dropdown.Button flat>{config.type}</Dropdown.Button>
                  <Dropdown.Menu onAction={(key) => handleConfigChange('type', key)}>
                    <Dropdown.Item key="PatternGenerator">PatternGenerator</Dropdown.Item>
                    <Dropdown.Item key="OpenAIGenerator">OpenAIGenerator</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>

            {
              config.type === "OpenAIGenerator" &&
              <Row>
                <Col>
                  <Text>OpenAI:</Text>
                  <Textarea
                    placeholder="openai"
                    value={config.openai}
                    onChange={(e) => handleConfigChange('openai', e.target.value)}
                    minHeight="200px"
                    width="100%"
                  />
                  <OptionsEditor
                    options={config.openaiOptions}
                    onOptionsChanged={(newOptions) =>
                      handleOptionsChange('openaiOptions', newOptions)
                    }
                  />
                </Col>
              </Row>
            }

            <Row>
              <Col>
                <Text>Prompt:</Text>
                <Textarea
                  placeholder="prompt"
                  value={config.prompt}
                  onChange={(e) => handleConfigChange('prompt', e.target.value)}
                  minHeight="200px"
                  width="100%"
                />
                <OptionsEditor
                  options={config.promptOptions}
                  onOptionsChanged={(newOptions) =>
                    handleOptionsChange('promptOptions', newOptions)
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Text>Comment:</Text>
                <Textarea
                  placeholder="comment"
                  value={config.comment}
                  onChange={(e) => handleConfigChange('comment', e.target.value)}
                  minHeight="200px"
                  width="100%"
                />
                <OptionsEditor
                  options={config.commentOptions}
                  onOptionsChanged={(newOptions) =>
                    handleOptionsChange('commentOptions', newOptions)
                  }
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Grid>
    </Grid.Container>
  );
};

export default ConfigEditor;
