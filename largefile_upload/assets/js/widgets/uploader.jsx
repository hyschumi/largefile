import React from 'react';
import $ from 'jquery';


export default class LargeFilerUploader extends React.Component {
    constructor(props) {
        super(props);
        this.shardSize = 10 * 1024 * 1024;
        this.shardUploadUrl = '/api/upload_shard';
        this.uploadUrl = '/api/upload';
        this.state = {
            successCount: 0,
        };
        this.ajaxWorkers = 0;
        this.currentIndex = 0;
        this.shardCount = 0;
        this.file = null;
        this.file_token = '';
    }

    componentDidMont() {

    }

    addWorker() {
        this.ajaxWorkers += 1;
        this.upload();
    }

    removerWorer() {
        this.ajaxWorkers -= 1;
        this.upload();
    }

    upload() {
        while (this.ajaxWorkers < 5 && this.currentIndex < this.shardCount) {
            const start = this.currentIndex * this.shardSize;
            const end = Math.min(this.file.size, (start + this.shardSize));
            const blobData = this.file.slice(start, end);
            this.uploadShard(blobData, this.currentIndex);
            this.currentIndex += 1;
            this.ajaxWorkers += 1;
        }
    }

    handleUpload() {
        this.ajaxWorkers = 0;
        this.currentIndex = 0;
        this.setState({
            successCount: 0,
        });
        this.file = document.querySelector(".uploader-wrapper input[type='file']").files[0];
        const size = this.file.size;
        this.shardCount = Math.ceil(size / this.shardSize);
        $.ajax({
            url: this.uploadUrl,
            type: 'PUT',
            data: { filename: this.file.name, size, shard_count: this.shardCount },
        })
        .done((data) => {
            this.file_token = data.file_token;
            this.addWorker();
        })
        .fail(() => {
            alert('上传失败');
        });
    }

    uploadShard(blobData, index) {
        const form = new FormData();
        form.append('data', blobData);
        form.append('index', index);
        form.append('file_token', this.file_token);
        form.append('shard_count', this.shardCount);

        $.ajax({
            url: this.shardUploadUrl,
            type: 'POST',
            data: form,
            processData: false,
            contentType: false,
        })
        .done(() => {
            this.setState({
                successCount: this.state.successCount + 1,
            });
        })
        .fail(() => {
            console.log('fail');
        })
        .always(() => {
            this.removerWorer();
        });
    }

    render() {
        let desc = '';
        if (this.state.successCount === 0) {
            desc = '';
        } else if (this.state.successCount < this.shardCount) {
            desc = '上传中';
        } else {
            desc = '上传完成';
        }
        return (
            <div>
                <div>
                    <span>{desc}</span>
                </div>
                <div className="uploader-wrapper">
                    <input type='file' />
                </div>
                <button onClick={this.handleUpload.bind(this)}>上传</button>
            </div>
        );
    }
}
