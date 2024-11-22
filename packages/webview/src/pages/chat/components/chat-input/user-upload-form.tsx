import React, { forwardRef, useImperativeHandle } from 'react';

import { useFormContext, Controller } from 'react-hook-form';
import { FilesPreview } from './file-preview';
import { observer } from 'mobx-react';
import { useRootStore } from 'src/stores';
import { TopicFileInput } from 'src/models';

export const FILE_EXTENSIONS_REGEX = /\.(png|jpg)$/i;

export const MAX_FILE_UPLOAD_SIZE = 10;

// Functional wrapper component
export const UserUploadForm = observer(
  forwardRef((props: any, ref: any) => {
    const { topicStore, zulipService } = useRootStore();
    const {
      formState: { errors },
      setValue,
      watch,
      setError,
      clearErrors,
      control,
    } = useFormContext<{
      file: FileList | null;
    }>();

    useImperativeHandle(ref, () => ({
      file,
      clearFile: () => setValue('file', null), // Clear the selected file
    }));

    const file = watch('file');

    const handleChangeFile = async (files: any) => {
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
        const payload = {
          file: _file,
          name: _file.name,
          type: _file.type,
        };
        const result = await zulipService.postUserUpload(payload);
        console.log(result);
        topicStore.addImageToTopic(
          new TopicFileInput({
            name: _file.name,
            path: zulipService.removeHost(result.url),
          }),
        );
      }
    };

    return (
      <>
        <FilesPreview data={file} setValue={setValue} />
        <Controller
          name="file"
          control={control}
          defaultValue={null}
          render={() => (
            <>
              <input
                type="file"
                id="fileInput"
                multiple
                style={{ display: 'none' }}
                onChange={(e: any) => handleChangeFile(e.target.files)}
              />
              {errors.file && <p>{errors.file.message}</p>}
              <i
                className="codicon codicon-cloud-upload"
                onClick={() => document?.getElementById('fileInput')?.click()}
              />
            </>
          )}
        />
      </>
    );
  }),
);
