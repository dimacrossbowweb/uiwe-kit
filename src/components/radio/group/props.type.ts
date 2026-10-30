export interface IProps {

	theme?: 'auto' | 'light' | 'dark';


	namespace: string;
	list: Array<Record<string, unknown>>;
	valueKey: string;

}