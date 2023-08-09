import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Row, Col, Dropdown, Switch, Spacer, Text, Collapse, Textarea, Input, Button } from '@nextui-org/react';
import { Slider } from 'components/slider';
import { TXT2IMG_DEFAULTS } from 'libs/api-sd';
import { SelectByIcon } from 'components/select-by-icon';
import { CustomCollapse } from 'components/custom-collapse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faRandom, faRecycle } from '@fortawesome/free-solid-svg-icons';
import { Box } from 'components/box';
import { useUserContext } from 'context';
import sdapi from 'libs/api-sd-remote';

const ModelOptions = ({label, value, onChange}) => {
  const { t } = useTranslation();
  const { preferences } = useUserContext();
  const { sdapi : sdapiHost } = preferences;
  const [ options, setOptions ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const reload = async () => {
    try{
      setError(null);
      setLoading(true);
      const { sdmodels } = sdapi(sdapiHost);
      const loadedOptions = await sdmodels();
      setOptions([{hash: null, model_name: 'NONE'}, ...loadedOptions]);
    }catch(err){
      console.error(err);
      setError(err);
    }finally{
      setLoading(false);
    }
  }
  useEffect(() => {reload()}, []);
  const related = options.filter(o => o.hash == value);
  const name = related.length > 0 ? related[0].model_name : value || 'NONE';
  
  return (
    <Row align='center'>
    {label && <Text small color='gray'>{label.toUpperCase()}</Text>}
    {label && <Spacer x={1}/>}
    <Dropdown>
      <Dropdown.Button auto light css={{padding: 0}}>{name || t('MSG.NOT_SPECIFIC')}</Dropdown.Button>
      <Dropdown.Menu 
        onAction={(key) => onChange(key === 'none' ? null : key)}>
        {options.map(option => 
          <Dropdown.Item 
            description={option.model_name}
            key={option.hash || 'none'}>{option.hash}</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
    </Row>
  );
}

const RemoteOptions = ({label, value, onChange, fetcher}) => {
  const { t } = useTranslation();
  const { preferences } = useUserContext();
  const { sdapi : sdapiHost } = preferences;
  const [ options, setOptions ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const reload = async () => {
    try{
      setError(null);
      setLoading(true);
      const func = sdapi(sdapiHost)[fetcher];
      const loadedOptions = await func({});
      setOptions(loadedOptions);
    }catch(err){
      console.error(err);
      setError(err);
    }finally{
      setLoading(false);
    }
  }
  useEffect(() => {reload()}, []);

  return (
    <Row align='center'>
    {label && <Text small color='gray'>{label.toUpperCase()}</Text>}
    {label && <Spacer x={1}/>}
    <Dropdown>
      <Dropdown.Button auto light css={{padding: 0}}>{value || t('MSG.NOT_SPECIFIC')}</Dropdown.Button>
      <Dropdown.Menu onAction={(key) => onChange(key)}>
        {options.map(option => 
          <Dropdown.Item key={option.name}>{option.name}</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
    </Row>
  );
}

const SamplerOptions = (props) => RemoteOptions({...props, fetcher: 'samplers'});
const UpscalerOptions = (props) => RemoteOptions({...props, fetcher: 'upscalers'});
const strSize = (obj) => `${obj?.width}x${obj?.height}`;
const strBasic = (obj) => `${obj?.sampler_index}.${obj?.steps}`;

const Icon = ({label, image, ...rest}) =>
  <div {...rest} style={{overflow: 'hidden', borderRadius: '10px', ...rest?.style, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <img src={image} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    { label && <nobr style={{
      position: 'absolute', top: 0, wordBreak: "keep-all", textAlign: 'center', 
      color: 'white', width: '100%', backgroundColor: '#00000055'
    }}>{label}</nobr>}
  </div>;

const PRESET_CONFIGS = { 
  "PRESET.BALANCE_PHOTO": { sampler_index: 'DPM++ SDE Karras', steps: 24 },
  "PRESET.FOCUS_PHOTO": { sampler_index: 'Euler a', steps: 40 },
  "PRESET.BALANCE_ANIMATE": { sampler_index: 'DDIM', steps: 30 },
  "PRESET.SHARP_PHOTO": { sampler_index: 'UniPC', steps: 40 },
}
const PRESET_SIZES = {
  "CARD.SQUARE": {width: 768, height: 768},
  "CARD.PORTRAIT": {width: 768, height: 1024},
  "CARD.LANDSCAPE": {width: 1024, height: 768}
};

export default ({config, onConfigChange, onResetSeed, onReuseSeed}) => {
  const { t } = useTranslation();

  const sizeString = strSize(config?.txt2imgOptions);
  const basicString = strBasic(config?.txt2imgOptions);

  return (
    <Collapse.Group>

      <CustomCollapse title={t('SECTION.SETTING_QUICK')} expanded>

        <Box css={{minHeight: '400px'}}>

          <Text small>{t('LABEL.COMPOSITION')}</Text>

          <SelectByIcon 
            gap={1}
            onChange={({value}) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, ...value})}
            value={{
              sampler_index: config?.txt2imgOptions?.sampler_index, 
              steps: config?.txt2imgOptions?.steps,
            }}
            >
            { 
              Object.keys(PRESET_CONFIGS).map(key => 
                <SelectByIcon.Option 
                  key={key}
                  selected={basicString == strBasic(PRESET_CONFIGS[key])}
                  value={PRESET_CONFIGS[key]}
                  icon={<Icon label={t(key)} image={`/images/${PRESET_CONFIGS[key].sampler_index}.5.png`} />}
                  />
              )
            }
          </SelectByIcon>

          <Text small>{t('LABEL.PAGE_SIZE')}</Text>

          <SelectByIcon 
            gap={1} 
            onChange={({value}) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, ...value})}
            value={{
              width: config?.txt2imgOptions?.width, 
              height: config?.txt2imgOptions?.height
            }}
            >
              {
                Object.keys(PRESET_SIZES).map(key => 
                  <SelectByIcon.Option 
                    key={key}
                    selected={ sizeString == strSize(PRESET_SIZES[key])}
                    value={PRESET_SIZES[key]}
                    icon={<Icon label={t(key)} image={`/images/${strSize(PRESET_SIZES[key])}.png`} />}/>
                )
              }
          </SelectByIcon>

          <Text small>{t('LABEL.QUALITY')}</Text>
          
          <Row align="center">
            <Switch 
              size="sm"
              checked={config?.txt2imgOptions?.enable_hr || TXT2IMG_DEFAULTS.enable_hr} 
              onChange={e => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, enable_hr: e.target.checked})}
              />
            <Spacer x={1} />
            <Text>{t('LABEL.HI_RES')}</Text>
          </Row>

          <Slider label={t('LABEL.DETAILED')} step={0.1} min={1} max={30} 
            values={[config?.txt2imgOptions?.cfg_scale || TXT2IMG_DEFAULTS.cfg_scale]} 
            onChange={([cfg_scale]) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, cfg_scale})} 
            />
        
        </Box>

      </CustomCollapse>

      <Collapse title={t('SECTION.SETTING_DETAILS')} >


        <ModelOptions 
          label="SD Model"
          value={config?.txt2imgOptions?.override_settings?.sd_model_checkpoint || null}
          onChange={(sd_model_checkpoint) => {

              if(!sd_model_checkpoint) {
                if(!!config?.txt2imgOptions?.override_settings?.sd_model_checkpoint){
                  const override_settings = {...config.txt2imgOptions.override_settings};
                  delete override_settings.sd_model_checkpoint;
                  onConfigChange('txt2imgOptions', { 
                    ...config.txt2imgOptions,
                    override_settings 
                  });
                }
                return;
              } else {

                if(!config?.txt2imgOptions)
                  config.txt2imgOptions = {};
                if(!config?.txt2imgOptions?.override_settings)
                  config.txt2imgOptions.override_settings = {};

                onConfigChange('txt2imgOptions', {
                  ...config?.txt2imgOptions,
                  override_settings: {
                    ...config?.txt2imgOptions?.override_settings,
                    sd_model_checkpoint
                  }
                })}

              }
            }
          />

        <Spacer y={1} />

        <Slider label="width" step={1} min={64} max={2048} 
          values={[config?.txt2imgOptions?.width || TXT2IMG_DEFAULTS.width]} 
          onChange={([width]) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, width})} 
          />

        <Spacer y={1} />

        <Slider label="height" step={1} min={64} max={2048} 
          values={[config?.txt2imgOptions?.height || TXT2IMG_DEFAULTS.height]} 
          onChange={([height]) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, height})} 
          />

        <Spacer y={1} />

        <SamplerOptions 
          label="Sampler"
          value={config?.txt2imgOptions?.sampler_index || TXT2IMG_DEFAULTS.sampler_index} 
          onChange={sampler_index => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, sampler_index})} 
          />

        <Spacer y={1} />
    
        <Slider label="Steps" step={1} min={1} max={150} 
          values={[config?.txt2imgOptions?.steps || TXT2IMG_DEFAULTS.steps]} 
          onChange={([steps]) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, steps})} 
          />

        <Spacer y={1} />

        <Slider label="CFG Scale" step={0.1} min={1} max={30} 
          values={[config?.txt2imgOptions?.cfg_scale || TXT2IMG_DEFAULTS.cfg_scale]} 
          onChange={([cfg_scale]) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, cfg_scale})} 
          />

        <Spacer y={1} />

        <Input 
          type="number" 
          initialValue={config?.txt2imgOptions?.seed || TXT2IMG_DEFAULTS.seed} 
          value={config?.txt2imgOptions?.seed || TXT2IMG_DEFAULTS.seed}
          labelRight={
            <>
              <Button auto light icon={<FontAwesomeIcon icon={faDice} />} onPress={onResetSeed} />
              <Button auto light icon={<FontAwesomeIcon icon={faRecycle} />} onPress={onReuseSeed} />
            </>
          }
          onChange={e => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, seed: parseInt(e.target.value)})}
          />

        <Spacer y={1} />
        
        <Row align="center">
          <Switch 
            size="sm"
            checked={config?.txt2imgOptions?.enable_hr || TXT2IMG_DEFAULTS.enable_hr} 
            onChange={e => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, enable_hr: e.target.checked})}
            />
          <Spacer x={1} />
          <Text>{t('LABEL.UPSCALE')}</Text>
        </Row>

        { config?.txt2imgOptions?.enable_hr &&
          <>

            <Spacer y={1} />

            <UpscalerOptions 
              label="Upscaler"
              value={config?.txt2imgOptions?.hr_upscaler || TXT2IMG_DEFAULTS.hr_upscaler}
              onChange={hr_upscaler => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, hr_upscaler})}
              />

            <Spacer y={1} />
          
            <Slider label="Hires steps" step={1} min={0} max={150} 
              values={[config?.txt2imgOptions?.hr_second_pass_steps || TXT2IMG_DEFAULTS.hr_second_pass_steps]} 
              onChange={([hr_second_pass_steps]) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, hr_second_pass_steps})} 
              />

            <Spacer y={1} />

            <Slider label="Upscale by" step={0.05} min={1} max={4} 
              values={[config?.txt2imgOptions?.hr_scale || TXT2IMG_DEFAULTS.hr_scale]} 
              onChange={([hr_scale]) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, hr_scale})} 
              />

            <Spacer y={1} />

            <Slider label="Denoising Strength" step={0.1} min={0} max={1} 
              values={[config?.txt2imgOptions?.denoising_strength || TXT2IMG_DEFAULTS.denoising_strength]} 
              onChange={([denoising_strength]) => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, denoising_strength})} 
              />

          </>
        }

      </Collapse>

      <Collapse title={t('SECTION.SETTING_NEGATIVE')}>
        <Row>
          <Textarea 
            css={{flex: 1, }}
            rows={10}
            initialValue={config?.txt2imgOptions?.negative_prompt || TXT2IMG_DEFAULTS.negative_prompt}
            onChange={e => onConfigChange('txt2imgOptions', {...config?.txt2imgOptions, negative_prompt: e.target.value})}
            />
        </Row>
      </Collapse>

    </Collapse.Group>
  );
}