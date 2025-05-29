import { NextRequest, NextResponse } from 'next/server';
import { SourceDetailsResponse } from '@/app/types/suggestion';
import { JSDOM } from 'jsdom';

export async function GET(request: NextRequest): Promise<NextResponse<SourceDetailsResponse>> {
    const searchParams = request.nextUrl.searchParams;
    const articleUrl = searchParams.get('articleUrl');

    if (articleUrl == null) {
        return NextResponse.json({error: {error: 'BadRequest', message: 'No articleUrl was provided'}}, {status: 400});
    }

    try {
        return await fetch(articleUrl).then(async (response: Response) => {
            const html = await response.text();
            const dom = new JSDOM(html);
            if (dom == null) {
                console.error(`Unable to parse DOM for URL ${articleUrl} - new JSDOM returned null`);
                return NextResponse.json({error: {error: 'InternalServerError', message: 'Unable to parse DOM'}}, {status: 500});
            } else {
                const title = (dom.window.document.querySelector('meta[property="og:title"]') as HTMLMetaElement).content;
                const description = (dom.window.document.querySelector('meta[property="og:description"]') as HTMLMetaElement).content;
                const imageLink = (dom.window.document.querySelector('meta[property="og:image"]') as HTMLMetaElement).content;
                return NextResponse.json({
                    data: {
                        title: title,
                        description: description,
                        image: imageLink
                    }
                });
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: {error: 'InternalServerError', message: 'Something strange happened, check server logs'}}, {status: 500});
    }
}