import {fetchAccountTriggers, webApi} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {useCallback, useState} from "react";

import {ConnectorCategory, CustomExtension, ExtensionKey} from "app/features/settings/api/types";
import {getTranslationKeys} from "app/features/settings/extensions.service";
import {useDispatch} from "app/redux/hooks";

export function useCustomExtensionConfigurationForm(
    extension: CustomExtension,
    connectorCategory: ConnectorCategory
) {
    const dispatch = useDispatch();

    const {added, creationError, deleted, deletionError}: ExtensionKey =
        getTranslationKeys(connectorCategory);

    const [isInstantiated, setIsInstantiated] = useState(extension.instantiated);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const instantiate = useCallback(
        async (parameters: Record<string, string | number | null>) => {
            setIsSubmitting(true);

            try {
                await webApi.fetchInstantiateExtension(
                    {
                        uid: extension.uid,
                    },
                    {
                        parameters,
                    }
                );
                setIsInstantiated(true);
                toast.success(t(added));

                dispatch(fetchAccountTriggers());
            } catch {
                toast.error(t(creationError, {platform_name: extension.name}));
            } finally {
                setIsSubmitting(false);
            }
        },
        [added, creationError, extension.name, extension.uid]
    );

    const uninstantiate = useCallback(async () => {
        setIsSubmitting(true);
        try {
            await webApi.fetchUninstantiateExtension(
                {
                    uid: extension.uid,
                },
                {}
            );
            setIsInstantiated(false);
            toast.success(t(deleted, {platform_name: extension.name}));

            dispatch(fetchAccountTriggers());
        } catch {
            toast.error(t(deletionError, {platform_name: extension.name}));
        } finally {
            setIsSubmitting(false);
        }
    }, [deleted, deletionError, extension.name, extension.uid]);

    return {
        isSubmitting,
        isInstantiated,
        instantiate,
        uninstantiate,
    };
}
