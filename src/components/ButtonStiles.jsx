import PropTypes from 'prop-types';

const ButtonStiles = ({ text, href, styleType, extraStyle, respFullWidth }) => {
    const styles = {
        light: 'bg-white text-dark border border-white hover:bg-dark hover:text-white hover:border-dark',
        dark: 'bg-dark text-white hover:bg-white hover:text-dark border border-dark hover:border-primary',
        primary: 'bg-primary text-dark hover:bg-dark hover:text-white border border-primary hover:border-dark',
    };

    const className = `font-semibold text-base p-4 min-w-64 rounded-full uppercase transition-all ${styles[styleType] || 'bg-white'} ${extraStyle || ''} ${respFullWidth ? 'w-full lg:w-fit' : ''}`;

    return (
        <button onClick={() => window.location.href = href} className={className}>
            {text}
        </button>
    );
}

ButtonStiles.propTypes = {
    text: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    styleType: PropTypes.oneOf(['light', 'dark', 'primary']), // Add more styles as needed
    extraStyle: PropTypes.string,
    respFullWidth: PropTypes.bool,
};

// Define default props
ButtonStiles.defaultProps = {
    respFullWidth: false,
};

export default ButtonStiles;