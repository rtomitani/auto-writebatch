import { firestore } from "firebase-admin";

export class AutoWriteBatch {
    private _db: FirebaseFirestore.Firestore;
    private _batch: FirebaseFirestore.WriteBatch;
    private _numOps: number;
    private readonly _limitOps: number;

    private async _incrementOp(): Promise<FirebaseFirestore.WriteResult[] | void> {
        this._numOps++;
        if (this._numOps >= this._limitOps) {
            const result = this.commit();
            this._batch = this._db.batch();
            return result;
        } else {
            return;
        }
    }

    constructor(
        db: FirebaseFirestore.Firestore,
        limitOps: number
    ) {
        this._db = db;
        this._batch = db.batch();
        this._numOps = 0;
        this._limitOps = limitOps;
    }

    create<T>(
        documentRef: FirebaseFirestore.DocumentReference<T>,
        data: T
    ): Promise<FirebaseFirestore.WriteResult[] | void> {
        this._batch.create(documentRef, data);
        return this._incrementOp();
    }

    set<T>(
        documentRef: FirebaseFirestore.DocumentReference<T>,
        data: T
    ): Promise<FirebaseFirestore.WriteResult[] | void>;
    set<T>(
        documentRef: FirebaseFirestore.DocumentReference<T>,
        data: Partial<T>,
        options: FirebaseFirestore.SetOptions
    ): Promise<FirebaseFirestore.WriteResult[] | void>;

    set<T>(
        documentRef: FirebaseFirestore.DocumentReference<T>,
        data: Partial<T>,
        options?: FirebaseFirestore.SetOptions
    ): Promise<FirebaseFirestore.WriteResult[] | void> {
        if(options == null) {
            this._batch.set(documentRef, data);
        } else {
            this._batch.set(documentRef, data, options);
        }
        return this._incrementOp();
    }

    update(
        documentRef: FirebaseFirestore.DocumentReference<any>,
        data: FirebaseFirestore.UpdateData,
        precondition?: FirebaseFirestore.Precondition
    ): Promise<FirebaseFirestore.WriteResult[] | void>;
    update(
        documentRef: FirebaseFirestore.DocumentReference<any>,
        field: string | FirebaseFirestore.FieldPath,
        value: any,
        ...fieldsOrPrecondition: any[]
    ): Promise<FirebaseFirestore.WriteResult[] | void>;

    update(
        documentRef: FirebaseFirestore.DocumentReference<any>,
        dataOrField: FirebaseFirestore.UpdateData | string | FirebaseFirestore.FieldPath,
        preconditionOrValue?: any,
        ...fieldsOrPrecondition: any[]
    ): Promise<FirebaseFirestore.WriteResult[] | void> {
        if(typeof dataOrField === 'string' || dataOrField instanceof firestore.FieldPath) {
            this._batch.update(documentRef, dataOrField, preconditionOrValue, fieldsOrPrecondition);
        } else {
            if(preconditionOrValue != null) {
                this._batch.update(documentRef, dataOrField, preconditionOrValue);
            } else {
                this._batch.update(documentRef, dataOrField);
            }
        }
        return this._incrementOp();
    }

    delete<T>(documentRef: FirebaseFirestore.DocumentReference<T>, precondition?: FirebaseFirestore.Precondition) {
        if(precondition == null) {
            this._batch.delete(documentRef);
        } else {
            this._batch.delete(documentRef, precondition);
        }
        return this._incrementOp();
    }

    commit(): Promise<FirebaseFirestore.WriteResult[]> {
        this._numOps = 0;
        return this._batch.commit();
    }
}