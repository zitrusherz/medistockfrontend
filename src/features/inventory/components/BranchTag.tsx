

interface BranchTagProps {
    branch: string;
}

export function BranchTag({ branch }: BranchTagProps) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {branch}
        </span>
    );
}

export type { BranchTagProps };
