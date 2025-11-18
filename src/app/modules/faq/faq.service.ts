import { FaqModel, IFaq } from './faq.interface';
import { Faq } from './faq.model';

const createFaqIntoDB = async (faq: IFaq): Promise<IFaq> => {
    const result = await Faq.create(faq);
    return result;
};

const getAllFaqFromDB = async (type: string): Promise<IFaq[]> => {
    const result = await Faq.find(type?{type}:{}).lean()
    return result;
};

const updateFaqIntoDB = async (id: string, faq: Partial<IFaq>): Promise<IFaq | null> => {
    const result = await Faq.findOneAndUpdate({ _id: id }, faq, { new: true });
    return result;
};

const deleteFaqFromDB = async (id: string): Promise<IFaq | null> => {
    const result = await Faq.findOneAndDelete({ _id: id });
    return result;
};


export const FaqServices = {
    createFaqIntoDB,
    getAllFaqFromDB,
    updateFaqIntoDB,
    deleteFaqFromDB
 };
