import React = require("react");

export const FileUploadButton = (props: {
  handleFile: (file: File) => void;
  acceptFileType: string;
}) => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (file) {
      props.handleFile(file);
    }
  };

  return (
    <label>
      <input
        className="hidden-file-input"
        type="file"
        accept={props.acceptFileType}
        onChange={onChange}
      />
      <span className="c-button fas fa-upload" />
    </label>
  );
};
