import React, { forwardRef, useImperativeHandle } from 'react';

import { useFormContext, Controller } from 'react-hook-form';
import { FilesPreview } from './file-preview';
// import { AtSign, CaseSensitive, Mic, Paperclip, Send, Smile, Video } from 'lucide-react';
import { observer } from 'mobx-react';
import { Tooltip } from '../ui/tooltip';

export const FILE_EXTENSIONS_REGEX = /\.(png|jpg)$/i;

export const MAX_FILE_UPLOAD_SIZE = 10;

// Functional wrapper component
export const UserUploadForm = observer(
  forwardRef((props: any, ref: any) => {
    const {
      formState: { errors },
      setValue,
      getValues,
      watch,
      setError,
      clearErrors,
      reset,
      control,
    } = useFormContext<{
      // chatbox__input: string;
      file: FileList | null;
    }>();

    useImperativeHandle(ref, () => ({
      file,
      clearFile: () => setValue('file', null), // Clear the selected file
    }));

    const file = watch('file');

    const handleChangeFile = (files: any, field: any) => {
      const _file = files[0];
      console.log('field', _file);
      let error: string | null = null;
      if (!_file) {
        error = 'Please select a file.';
      }
      if (_file.size && _file.size > 1024 * 1024 * MAX_FILE_UPLOAD_SIZE) {
        error = 'Please select a file smaller than 5MB.';
      }
      if (_file.name && !FILE_EXTENSIONS_REGEX.test(_file.name)) {
        error = 'Please select an image PNG or JPG file.';
      }
      if (error) {
        setError('file', {
          message: error,
          type: 'custom',
        });
        return;
      } else {
        clearErrors('file');
        field.onChange && field.onChange(files);
      }
    };

    return (
      <>
        <FilesPreview data={file} setValue={setValue} />
        <Controller
          name="file"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <>
              <input
                type="file"
                id="fileInput"
                multiple
                style={{ display: 'none' }}
                onChange={(e: any) => handleChangeFile(e.target.files, field)}
              />
              {errors.file && <p>{errors.file.message}</p>}
              {/* <Tooltip tooltipContent={file ? "Edit" : "Upload File"} openOnTargetFocus={false} position="top"> */}
              <i
                className="codicon codicon-cloud-upload"
                onClick={() => document?.getElementById('fileInput')?.click()}
              />
              {/* </Tooltip> */}
            </>
          )}
        />
      </>
    );
  }),
);
