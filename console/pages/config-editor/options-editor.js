// OptionsEditor.js
import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col } from '@nextui-org/react';
import { Plus, CloseSquare } from 'react-iconly';

const OptionsEditor = ({ options = {}, onOptionsChanged }) => {
  const [bufferedKeys, setBufferedKeys] = useState(Object.keys(options));

  useEffect(() => {
    setBufferedKeys(Object.keys(options));
  }, [options]);

  const handleKeyChange = (index, newKey) => {
    const newBufferedKeys = [...bufferedKeys];
    newBufferedKeys[index] = newKey;
    setBufferedKeys(newBufferedKeys);
  };

  const handleKeyBlur = (key, newKey) => {
    if (key === newKey || options.hasOwnProperty(newKey)) {
      return;
    }

    const newOptions = { ...options };
    newOptions[newKey] = newOptions[key];
    delete newOptions[key];

    onOptionsChanged(newOptions);
  };

  const handleValueChange = (key, newValue) => {
    const newOptions = { ...options, [key]: newValue };
    onOptionsChanged(newOptions);
  };

  const addOption = () => {
    let newKey = 'newOption';
    let i = 1;
    while (options.hasOwnProperty(newKey)) {
      newKey = `newOption${i}`;
      i++;
    }
    onOptionsChanged({ ...options, [newKey]: '' });
  };

  const deleteOptions = (key) => {
    const newOptions = { ...options };
    delete newOptions[key];
    onOptionsChanged(newOptions);
  };

  return (
    <>
      {bufferedKeys.map((key, index) => (
        <Row key={index} css={{ marginTop: 5 }}>
          <Input
            size="sm"
            aria-label={key}
            labelLeft={
              <Button auto light css={{margin:0,padding:0}} onClick={() => deleteOptions(key)}>
                <CloseSquare 
                  set="broken" 
                  primaryColor="error" 
                  aria-label={key}
                />
              </Button>
            }
            value={key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
            onBlur={(e) => handleKeyBlur(key, e.target.value)}
          />
          <Input
            css={{flex: 1, marginLeft: 5}}
            size="sm"
            value={options[key]}
            onChange={(e) => handleValueChange(key, e.target.value)}
            />
        </Row>
      ))}
      <Row css={{marginTop: 5}}>
        <Col>
          <Input 
            type="button"
            size="sm"
            value="增加選項"
            onClick={addOption}
            labelLeft={<Plus set="broken" primaryColor="default"/>}
            />
        </Col>
      </Row>
    </>
  );
};

export default OptionsEditor;
