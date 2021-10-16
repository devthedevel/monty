export interface MessageComponentData {
    custom_id?: string;
    component_type?: number;
    values?: MessageComponentSelectOption[];
}

export interface MessageComponentSelectOption {
    label: string;
    value: string;
    description?: string;
    emoji?: { };
    default?: boolean;
}