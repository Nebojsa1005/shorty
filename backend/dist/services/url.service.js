export const populateAnalytics = async (url) => {
    return url.populate('Analytics');
};
