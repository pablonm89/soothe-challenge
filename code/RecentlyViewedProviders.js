import React from 'react';

class RecentlyViewedProviders extends React.Component {
    constructor(props) {
        super(props);
    }

    handleProviderClick(provider) {
        console.log(provider);
    }

    renderAvatar(provider) {
        if (!provider.avatar) return (
            <div className="provider-icon provider-placeholder">{provider.name.charAt(0).toUpperCase()}</div>
        );

        return (
            <img className="provider-icon provider-avatar" src={provider.avatar} alt={provider.name} />
        )
    }

    renderRating(provider) {
        if (!provider.rating) return null;

        return (
            <div className="provider-rating">
                <span className="star">*</span>
                <span>{provider.rating}</span>
            </div>
        )
    }

    render() {
        const { providers } = this.props;

        if (!providers || !providers.length) return null;

        return (
            <div className="recently-viewed-providers-container">
                <h2 className="title">Recently Viewed Providers</h2>

                <div className="recently-viewed-providers-row">
                    {providers.map(provider => {
                        return (
                            <div key={provider.id} className="provider-card" onClick={() => this.handleProviderClick(provider)}>
                                {this.renderAvatar(provider)}
                                <div className="provider-name">{provider.name}</div>
                                {this.renderRating(provider)}
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
}

export default RecentlyViewedProviders;