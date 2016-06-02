import React from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import "css/main.scss";

class FilesPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataReady: false,
        };
        this.init();
        this.files = [];
    }

    init() {
        $.ajax({
            url: '/api/files',
        })
        .done((data) => {
            this.files = data.results;
            this.setState({
                dataReady: true,
            });
        })
        .fail(() => {
            alert('数据获取失败');
        });
    }

    render() {
        if (!this.state.dataReady) {
            return (
                <div>数据加载中</div>
            );
        }
        return (
            <div>
                <ul>
                    {this.files.map(item => {
                        return (
                            <li key={item.file_token}>
                                <a href={`/api/download?file_token=${item.file_token}`}>
                                    {item.filename}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
}

ReactDom.render(
    <FilesPage />,
    document.getElementById('main')
);
