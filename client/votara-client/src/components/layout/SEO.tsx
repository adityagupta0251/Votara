import { Helmet } from "react-helmet-async";

interface SEOProps {
    title: string;
    description?: string;
}

export function SEO({ title, description }: SEOProps) {
    const fullTitle = `${title} | Votara Governance`;
    const defaultDescription = "Votara Institutional Governance - Real-time monitoring of DAO metrics and treasury.";

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Helmet>
    );
}
