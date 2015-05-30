import unittest
import requests
import config


class Requests(unittest.TestCase):

    def test(self):

        self.id = 0

        def is_up():
            r = requests.get(config.BASE_URI)
            return r.status_code

        def big_http_request():
            url = config.BASE_URI + '/api/automaton/create'
            data = {'name': 'test', 'data': 10000 * '{"states":{"q_1":true}}'}
            r = requests.post(url, data)
            self.id = r.text
            return r.status_code

        def delete():
            url = url = config.BASE_URI + '/api/automaton/delete/'
            r = requests.post(url + str(self.id))
            return r.status_code

        self.assertEqual(is_up(), 200)
        self.assertEqual(big_http_request(), 200)
        self.assertEqual(delete(), 200)
