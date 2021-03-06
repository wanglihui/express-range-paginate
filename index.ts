import { Request, Response, NextFunction } from "express-serve-static-core";

export interface IPaginate {
    limit?: number;
    offset?: number;
}
export interface IPaginateRequest extends Request {
    paginate: IPaginate;
}

export function paginateMiddleware(options?: {keyword?: string, maxLimit?: number}) {
    if (!options) {
        options = {};
    }
    let {keyword} = options;
    if (!keyword) {
        keyword = 'Range'
    }
    return (req: IPaginateRequest, _: Response, next: NextFunction) => {
        let offset = req.query.offset;
        let limit = req.query.limit;
        let range = req.headers[keyword as string] as string || req.headers[(keyword as string).toLowerCase()] as string;
        let rangeto = 0;
        let rangeOffset: number = 0;
        if (!options!.maxLimit) {
            options!.maxLimit = 20;
        }
        if (range) {
            let group = /items\s*(:|=)\s*(\d+)-(\d+|\*)/.exec(range);
            if (group) {
                rangeOffset = group[2] && parseInt(group[2]) || 0;
                if (group[3] == '*') {
                    rangeto = options!.maxLimit || 0;
                } else {
                    rangeto = group[3] && parseInt(group[3]) || 0;
                }
            } else {
                rangeto = options!.maxLimit as number;
            }
        } else {
            rangeto = options!.maxLimit as number;
        }
        if (!offset && offset !== 0) {
            offset = rangeOffset;
        }
        if (!limit && limit !== 0) {
            limit = rangeto - offset + 1;
        }
        req.paginate = {};
        req.paginate.limit = limit;
        req.paginate.offset = offset;
        return next();
    }
}

export function paginateRespHelper(pageCount: number, offset: number, total: number) {
    return (res: Response) => {
        res.set('Access-Control-Expose-Headers', 'Content-Range');
        res.set('Content-Range', `items ${offset}-${pageCount}/${total}`);
    }
}