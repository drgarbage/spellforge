import { Input, Text, Row } from '@nextui-org/react';
import * as React from 'react';
import { Range } from 'react-range';

const styles = {
  track: {
    flex: 1,
    height: '1px',
    backgroundColor: '#000'
  },
  thumb: {
    height: '24px',
    width: '24px',
    backgroundColor: '#000',
    borderRadius: '12px',
  },
  input: {
    border: 'none',
    marginLeft: '20px',
    width: '80px',
  }
}

const limited = (min, max, value) => {
  if(value < min) return min;
  if(value > max) return max;
  return value;
}

export const Slider = ({label, step = 0.1, min = 0, max = 100, values = [10], onChange = () => {}}) => 
<>
  { !!label && <Text small color='gray'>{label.toUpperCase()}</Text>}
  <Row align='center' css={{display:'flex'}}>
  <Range
    step={step}
    min={min}
    max={max}
    values={values}
    onChange={onChange}
    renderTrack={({ props, children }) => (<div {...props} style={{...props.style, ...styles.track}}>{children}</div>) }
    renderThumb={({ props }) => (<div {...props} style={{ ...props.style, ...styles.thumb }} />) }
    />
  <input 
    type="number" 
    style={styles.input}
    value={values[0]} 
    onChange={e => onChange([parseFloat(e.target.value)])}
    />
  </Row>
</>