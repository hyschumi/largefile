# -*- coding:utf-8 -*-
import logging
from os import path as op

from tornado.web import Application
from tornado.ioloop import IOLoop
from tornado.httpserver import HTTPServer
from tornado.options import options, define, parse_command_line
from .handler import IndexHandler, FileUploadHandler, ShardUploadHandler, DownloadHandler
from .handler import FilesHandler, FilesPageHandler


class FileApp(Application):
    def __init__(self, routes):
        self_dir_path = op.abspath(op.dirname(__file__))
        app_settings = dict(
            debug=options.debug,
            template_path=op.join(self_dir_path, 'templates'),
            static_path=op.join(self_dir_path, 'static'),
        )
        self.files_dir = 'files'

        super(FileApp, self).__init__(routes, **app_settings)


def main():
    define_options()
    routes = [
        ('/index', IndexHandler),
        ('/api/upload', FileUploadHandler),
        ('/api/upload_shard', ShardUploadHandler),
        ('/api/download', DownloadHandler),
        ('/api/files', FilesHandler),
        ('/files', FilesPageHandler),
    ]
    app = FileApp(routes)
    start(app)


def define_options():
    define('port', default=8888)
    define('debug', default=True)


def start(app):
    parse_command_line(final=True)
    server = HTTPServer(app, xheaders=True)
    server.listen(options.port)
    # server.start(0)
    logging.info('Everything seems good.')
    IOLoop.instance().start()
    logging.info('Bye')
