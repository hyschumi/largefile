# -*- coding:utf-8 -*-
import time
import os
from tornado.web import RequestHandler, HTTPError


class BaseHandler(RequestHandler):
    @property
    def files_dir(self):
        return self.application.files_dir


class IndexHandler(RequestHandler):
    def get(self):
        return self.render('index.html', entryjs='upload.js')


class FilesPageHandler(RequestHandler):
    def get(self):
        return self.render('index.html', entryjs='files.js')


class FileUploadHandler(BaseHandler):

    def put(self):
        token = str(int(time.time()))
        filename = self.get_body_argument('filename')
        size = self.get_argument('size')
        shard_count = self.get_argument('shard_count')
        try:
            int(size)
            int(shard_count)
        except:
            raise HTTPError(400, log_message='argument error')
        lines = ['filename: ' + filename, 'shard_count: ' + shard_count, 'size: ' + size]
        os.mkdir('%s/%s' % (self.files_dir, token))
        with open('%s/%s/%s' % (self.files_dir, token, 'meta'), 'w') as meta:
            for line in lines:
                meta.write(line + '\n')
        self.write(dict(file_token=token))
        self.finish()


class ShardUploadHandler(BaseHandler):
    def post(self):
        try:
            index = int(self.get_body_argument('index'))
            shard_count = int(self.get_argument('shard_count'))
        except:
            raise HTTPError(400)
        file_token = self.get_body_argument('file_token')
        data = self.request.files['data'][0]['body']
        file_path = '%s/%s/%s' % (self.files_dir, file_token, str(index))
        with open(file_path, 'wb') as f:
            f.write(data)
        if index == shard_count - 1:
            with open('%s/%s/%s' % (self.files_dir, file_token, 'meta'), 'r') as meta:
                data = meta.readlines()
                filename = data[0].split(':')[1].strip()
            with open('%s/%s' % (self.files_dir, 'meta'), 'a') as f:
                f.write(file_token + ':' + filename + '\n')
        self.write(dict(status=True, index=index))
        self.finish()


class DownloadHandler(BaseHandler):
    def get(self):
        file_token = self.get_argument('file_token')
        shard_count = 0
        self.set_header('Content-Type', 'application/octet-stream')
        if not os.path.exists('%s/%s/%s' % (self.files_dir, file_token, 'meta')):
            raise HTTPError(404)
        file_path = '%s/%s/%s' % (self.files_dir, file_token, 'meta')
        with open(file_path, 'r') as meta:
            data = meta.readlines()
            shard_count = int(data[1].split(':')[1].strip())
            filename = data[0].split(':')[1].strip()
            self.set_header('Content-Disposition', 'attachment; filename='+filename)
        for i in range(shard_count):
            file_path = '%s/%s/%s' % (self.files_dir, file_token, str(i))
            with open(file_path, 'rb') as f:
                self.write(f.read())
                self.flush()
        self.finish()


class FilesHandler(BaseHandler):
    def get(self):
        files = []
        path = '%s/%s' % (self.files_dir, 'meta')
        if os.path.exists(path):
            with open(path, 'r') as f:
                for line in f.readlines():
                    token, filename = line.split(':')
                    files.append({'filename': filename.strip(), 'file_token': token.strip()})
        self.write(dict(results=files))
        self.finish()
