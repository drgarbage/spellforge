// OptionsEditor.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Input, Button, Row, Col, Text } from '@nextui-org/react';
import { Plus, CloseSquare, ChevronDown, ChevronUp } from 'react-iconly';
import uid from 'tiny-uid';


const OptionRow = ({ optionKey, value, onKeyChanged, onOptionChanged, onDelete }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [optionValues, setOptionValues] = useState(
      Array.isArray(value) ? 
        value.map(v => ({id: uid(7), value: v})) : 
        [{id: uid(7), value}]
      );
  const key = optionKey;
  
  const onOptionKeyEditStart = (value) => {
    setEditing(value);
  }

  const onOptionKeyEditing = (value) => {
    setEditing(value);
  }

  const onOptionKeyEditEnd = (value) => {
    if(editing == null) return;
    if(editing === key) return;
    onKeyChanged(key, editing);
    setEditing(null);
  }

  const onLineChanged = (index, newValue) => {
    const values = [...optionValues];
    values[index].value = newValue;
    setOptionValues(values);
  }

  const onDeleteLine = (index) => {
    const values = [...optionValues];
    values.splice(index, 1);
    setOptionValues(values);
    if(values.length <= 1) {
      setShowAll(false);
    }
  }

  const onAddLine = () => {
    setOptionValues([...optionValues, {id: uid(7), value: ''}]);
  }

  useEffect(() => {

    let output = '';

    if(optionValues.length > 1)
      output = optionValues.map(v => v.value);
    else if(optionValues.length === 1)
      output = optionValues[0].value;
    else if(optionValues.length === 0)
      output = '';
    else
      output = '';

    onOptionChanged(key, output);

  }, [optionValues]);

  return (
    <>
      <Row key={key} css={{ marginTop: 5 }}>
        <Input
          aria-label={key}
          css={{minWidth: '140px', maxWidth: '140px'}}
          size="sm"
          labelLeft={
            <Button 
              auto light 
              aria-label='Delete Option'
              css={{margin:0,padding:0}} 
              onPress={() => onDelete(key)}
              icon={
                <CloseSquare 
                  set="broken" 
                  primaryColor="error" 
                  aria-label={key}
                />
              }/>
          }
          initialValue={editing != null ? editing : key}
          onFocus={e => onOptionKeyEditStart(e.target.value)}
          onChange={e => onOptionKeyEditing(e.target.value)}
          onBlur={e => onOptionKeyEditEnd(e.target.value)}
        />

        {
          (() => {
            const isMultiple = optionValues.length > 1;
            const clickAction = isMultiple ? 
              () => setShowAll(!showAll) : 
              () => { onAddLine(); setShowAll(true);};
            const Icon = isMultiple ?
              (showAll ? ChevronUp : ChevronDown) :
              Plus;
            const props = {
              size: "sm",
              type: isMultiple ? 'button' : 'text',
              onClick: isMultiple ? clickAction : null,
              initialValue: isMultiple ? t('MSG.MULTIPLE_OPTIONS').replace('[count]', value.length) : optionValues[0].value || '',
              onChange: isMultiple ?
                null :
                e => onLineChanged(0, e.target.value)
            };

            return (
              <Input
                aria-label={`settings of ${key}`}
                css={{flex: 1, marginLeft: 5}}
                style={{textAlign: 'left'}}
                labelRight={
                  <Button 
                    auto light 
                    aria-label='Toggle Option Lines'
                    css={{margin:0,padding:0}} 
                    onPress={clickAction} 
                    icon={<Icon size="small" set="light"/>}
                    />
                }
                {...props}
                />
            );
          })()
        }
      </Row>


      {
        showAll && 
        <>
          {
            optionValues.map(({id, value}, index) => 
            <Row key={id} css={{ marginTop: 5 }}>
              <Input 
                multiple
                labelLeft={
                  <Button 
                    auto light
                    aria-label={`Delete Options ${value}`}
                    css={{margin:0,padding:0}} 
                    onPress={() => onDeleteLine(index)}
                    >
                    <CloseSquare 
                      set="broken" 
                      primaryColor="error" 
                      css={{marginRight: 5}}
                      aria-label={key}
                    />
                    <Text>&nbsp;{`${index+1}`}</Text>
                  </Button>
                }
                css={{flex: 1}}
                initialValue={value}
                onChange={(e) => onLineChanged(index, e.target.value)}
                />
            </Row>
            )
          }
          <Row css={{marginTop: 5}}>
            <Input 
              type="button"
              initialValue={t('MSG.ADD_OPTION_TO').replace('[option]', key)}
              onClick={onAddLine}
              />
          </Row>
        </>
        
      }
    </>
  );
}

const OptionsEditor = ({ options = {}, onOptionsChanged }) => {
  const { t } = useTranslation();
  const keys = Object.keys(options);
  
  const onKeyChanged = (key, newKey) => {
    const newOptions = {...options, [newKey]: options[key]};
    delete newOptions[key];
    onOptionsChanged(newOptions);
  }

  const onOptionChanged = (key, value) => {
    onOptionsChanged({ ...options, [key]: value });
  }

  const onDelete = (key) => {
    const newOptions = { ...options };
    delete newOptions[key];
    onOptionsChanged(newOptions);
  }

  const addOption = () => {
    let newKey = 'newOption';
    let i = 1;
    while (options.hasOwnProperty(newKey)) {
      newKey = `newOption${i}`;
      i++;
    }
    onOptionsChanged({ ...options, [newKey]: '' });
  };

  return (
    <>
      {keys.map((key) => 
        <OptionRow 
          key={key} 
          optionKey={key}
          value={options[key]} 
          onKeyChanged={onKeyChanged}
          onOptionChanged={onOptionChanged}
          onDelete={onDelete}
          />
      )}
      <Row css={{marginTop: 5}}>
        <Col>
          <Input 
            aria-label={t('BTN.ADD_OPTION')}
            type="button"
            size="sm"
            initialValue={t('BTN.ADD_OPTION')}
            onClick={addOption}
            labelLeft={<Plus set="broken" primaryColor="default"/>}
            />
        </Col>
      </Row>
    </>
  );
};

export default OptionsEditor;
