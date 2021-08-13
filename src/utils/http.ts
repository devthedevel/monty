export interface Header {
    [header: string]: string
}

export interface HttpResponse {
    headers?: Header;
    statusCode: number;
    body?: string;
}

export const Response = <T>(statusCode: number, body?: string | T, headers?: Header): HttpResponse => {
    const response: HttpResponse = {
        statusCode: statusCode
    };

    let _headers: Header = {...headers};

    if (typeof body === 'string') {
        _headers['Content-Type'] = 'text/plain';
        response.body = body;
    } else if (typeof body === 'object' && body !== null) {
        _headers['Content-Type'] = 'application/json'
        response.body = JSON.stringify(body);
    }

    if (Object.keys(_headers).length !== 0) {
        response.headers = {..._headers};
    }

    return response;
};