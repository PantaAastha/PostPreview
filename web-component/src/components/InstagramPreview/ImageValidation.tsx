import { useState, useEffect } from 'react';
import {
    loadImageDimensions,
    validateImageDimensions,
    getLoadingState,
    getErrorState,
    type ImageValidationResult,
} from '../../utils/imageValidation';
import './ImageValidation.css';

interface ImageValidationProps {
    imageUrl: string | null;
}

/**
 * Displays image validation results for Instagram
 */
export function ImageValidation({ imageUrl }: ImageValidationProps) {
    const [validation, setValidation] = useState<ImageValidationResult>(getLoadingState());

    useEffect(() => {
        if (!imageUrl) {
            setValidation(getErrorState('No image provided'));
            return;
        }

        setValidation(getLoadingState());

        loadImageDimensions(imageUrl)
            .then((dimensions) => {
                setValidation(validateImageDimensions(dimensions));
            })
            .catch(() => {
                setValidation(getErrorState('Could not analyze image'));
            });
    }, [imageUrl]);

    if (!imageUrl) {
        return null;
    }

    if (validation.isLoading) {
        return (
            <div className="image-validation image-validation--loading">
                <span className="image-validation-icon">⏳</span>
                <span>Analyzing image...</span>
            </div>
        );
    }

    if (validation.error) {
        return (
            <div className="image-validation image-validation--error">
                <span className="image-validation-icon">⚠️</span>
                <span>{validation.error}</span>
            </div>
        );
    }

    return (
        <div className="image-validation">
            <div className="image-validation-header">
                <span className="image-validation-title">Image Quality</span>
            </div>

            <div className="image-validation-items">
                {/* Aspect Ratio */}
                {validation.aspectRatio && (
                    <div className={`image-validation-item image-validation-item--${validation.aspectRatio.status}`}>
                        <span className="image-validation-icon">
                            {validation.aspectRatio.status === 'valid' ? '✅' : '⚠️'}
                        </span>
                        <span className="image-validation-label">Aspect Ratio</span>
                        <span className="image-validation-value">{validation.aspectRatio.ratio}</span>
                    </div>
                )}

                {/* Resolution */}
                {validation.resolution && (
                    <div className={`image-validation-item image-validation-item--${validation.resolution.status}`}>
                        <span className="image-validation-icon">
                            {validation.resolution.status === 'valid' ? '✅' : validation.resolution.status === 'warning' ? '⚠️' : '❌'}
                        </span>
                        <span className="image-validation-label">Resolution</span>
                        <span className="image-validation-value">
                            {validation.dimensions ? `${validation.dimensions.width}×${validation.dimensions.height}` : 'Unknown'}
                        </span>
                    </div>
                )}
            </div>

            {/* Show message if there are issues */}
            {(validation.aspectRatio?.status !== 'valid' || validation.resolution?.status !== 'valid') && (
                <div className="image-validation-tips">
                    {validation.aspectRatio?.status !== 'valid' && (
                        <p className="image-validation-tip">💡 {validation.aspectRatio?.message}</p>
                    )}
                    {validation.resolution?.status !== 'valid' && (
                        <p className="image-validation-tip">💡 {validation.resolution?.message}</p>
                    )}
                </div>
            )}
        </div>
    );
}
