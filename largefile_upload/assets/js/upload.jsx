import React from 'react';
import ReactDom from 'react-dom';
import LargeFilerUploader from 'js/widgets/uploader.jsx';
import "css/main.scss";

class UploadPage extends React.Component {

    render() {
        return (
            <div>
                <LargeFilerUploader />
                <div>
                    <a href='/files'>上传列表</a>
                </div>
            </div>
        );
    }
}

ReactDom.render(
    <UploadPage />,
    document.getElementById('main')
);
