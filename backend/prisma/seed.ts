import {config} from "dotenv";
import {join} from "path";
import {PrismaClient} from "@prisma/client";
import {PrismaMariaDb} from "@prisma/adapter-mariadb";

// Load environment variables
config({path: join(process.cwd(), "..", ".env.example")});
config();

interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

function getDatabaseConfigFromUrl(databaseUrl: string): DatabaseConfig {
    try {
        const url = new URL(databaseUrl);
        const database = url.pathname.replace(/^\//, "");

        if (!database) {
            throw new Error("Database name is required in URL (e.g., mysql://root:rootPassword@localhost:3306/document_management_systems)");
        }

        return {
            host: url.hostname,
            port: url.port ? Number(url.port) : 3306,
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database,
        };
    } catch (error) {
        throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
    }
}

// Folder seed data
const FOLDERS = [
    // Root folders
    {name: "Appointments resolutions", parentId: null, createdBy: "John Green"},
    {name: "Policy approvals", parentId: null, createdBy: "John Green"},
    {name: "Shared", parentId: null, createdBy: "John Green"},

    // Company subfolders
    {name: "HR", parentName: "Appointments resolutions", createdBy: "John Green"},
    {name: "Finance", parentName: "Appointments resolutions", createdBy: "John Green"},
    {name: "Engineering", parentName: "Appointments resolutions", createdBy: "John Green"},
    {name: "Marketing", parentName: "Appointments resolutions", createdBy: "John Green"},
    {name: "Sales", parentName: "Appointments resolutions", createdBy: "John Green"},

    // HR subfolders
    {name: "Employee Records", parentName: "Policy approvals", createdBy: "John Green"},
    {name: "Policies", parentName: "Policy approvals", createdBy: "John Green"},
    {name: "Recruitment", parentName: "Policy approvals", createdBy: "John Green"},

    // Finance subfolders
    {name: "Invoices", parentName: "Finance", createdBy: "John Green"},
    {name: "Tax Returns", parentName: "Finance", createdBy: "John Green"},
    {name: "Invoices 2025", parentName: "Invoices", createdBy: "John Green"},

    // Engineering subfolders
    {name: "Backend", parentName: "Engineering", createdBy: "John Green"},
    {name: "Frontend", parentName: "Engineering", createdBy: "John Green"},
    {name: "API Documentation", parentName: "Backend", createdBy: "John Green"},
    {name: "React Components", parentName: "Frontend", createdBy: "John Green"},
    {name: "Kubernetes Configs", parentName: "DevOps", createdBy: "John Green"},

    // Marketing subfolders
    {name: "Campaigns", parentName: "Marketing", createdBy: "John Green"},
    {name: "Social Media", parentName: "Marketing", createdBy: "John Green"},
    {name: "Q2 Campaigns", parentName: "Campaigns", createdBy: "John Green"},

    // Personal subfolders
    {name: "Travel", parentName: "Shared", createdBy: "John Green"},
    {name: "Japan Trip", parentName: "Travel", createdBy: "John Green"},
    {name: "Europe Trip", parentName: "Travel", createdBy: "John Green"},
];

// Document seed data
const DOCUMENTS = [
    // HR documents
    {
        title: "Employee Handbook 2026",
        description: "Complete employee guidelines and policies",
        fileName: "employee-handbook-2026.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 2_456_789,
        folderName: "Policies"
    },
    {
        title: "Code of Conduct",
        description: "Company code of conduct and ethics",
        fileName: "code-of-conduct.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 987_654,
        folderName: "Policies"
    },
    {
        title: "Benefits Overview",
        description: "Health, dental, and retirement benefits",
        fileName: "benefits-overview.pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        createdBy: "John Green",
        sizeBytes: 3_234_567,
        folderName: "Employee Records"
    },
    {
        title: "Job Description - Senior Developer",
        description: "Job posting for senior developer role",
        fileName: "senior-dev-jd.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        createdBy: "John Green",
        sizeBytes: 234_567,
        folderName: "Recruitment"
    },

    // Finance documents
    {
        title: "Annual Budget 2026",
        description: "Company-wide budget allocation",
        fileName: "budget-2026.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        createdBy: "John Green",
        sizeBytes: 1_876_543,
        folderName: "Budget"
    },
    {
        title: "Q1 Financial Report",
        description: "Quarterly financial summary",
        fileName: "q1-report.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 1_234_567,
        folderName: "Budget"
    },
    {
        title: "Invoice INV-2026-001",
        description: "Consulting services - January",
        fileName: "INV-2026-001.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 345_678,
        folderName: "Invoices 2026"
    },
    {
        title: "Invoice INV-2026-002",
        description: "Software licenses - January",
        fileName: "INV-2026-002.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 456_789,
        folderName: "Invoices 2026"
    },
    {
        title: "Invoice INV-2025-089",
        description: "Consulting services - December",
        fileName: "INV-2025-089.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 234_567,
        folderName: "Invoices 2025"
    },
    {
        title: "Tax Return 2025",
        description: "Annual corporate tax filing",
        fileName: "tax-2025.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 5_678_901,
        folderName: "Tax Returns"
    },

    // Engineering documents
    {
        title: "API Specification v2",
        description: "OpenAPI specification for backend services",
        fileName: "api-spec-v2.yaml",
        mimeType: "text/yaml",
        createdBy: "John Green",
        sizeBytes: 45_678,
        folderName: "API Documentation"
    },
    {
        title: "Database Schema",
        description: "ER diagram and schema documentation",
        fileName: "schema.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 876_543,
        folderName: "API Documentation"
    },
    {
        title: "React Component Library",
        description: "Storybook documentation",
        fileName: "components-storybook.html",
        mimeType: "text/html",
        createdBy: "John Green",
        sizeBytes: 12_345_678,
        folderName: "React Components"
    },
    {
        title: "Kubernetes Deployment Guide",
        description: "How to deploy services to k8s",
        fileName: "k8s-deploy.md",
        mimeType: "text/markdown",
        createdBy: "John Green",
        sizeBytes: 23_456,
        folderName: "Kubernetes Configs"
    },

    // Marketing documents
    {
        title: "Q1 Campaign Assets",
        description: "Creative assets for Q1 campaign",
        fileName: "q1-campaign.zip",
        mimeType: "application/zip",
        createdBy: "John Green",
        sizeBytes: 45_678_901,
        folderName: "Q1 Campaigns"
    },
    {
        title: "Social Media Calendar",
        description: "Q1 posting schedule",
        fileName: "social-calendar.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        createdBy: "John Green",
        sizeBytes: 567_890,
        folderName: "Social Media"
    },
    {
        title: "Brand Guidelines 2026",
        description: "Official brand style guide",
        fileName: "brand-guidelines-2026.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 8_765_432,
        folderName: "Brand Assets"
    },

    // Personal documents
    {
        title: "Japan Itinerary",
        description: "2-week Japan travel plan",
        fileName: "japan-itinerary.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        createdBy: "John Green",
        sizeBytes: 234_567,
        folderName: "Japan Trip"
    },
    {
        title: "Flight Confirmations",
        description: "Tokyo flights",
        fileName: "flight-confirmations.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 1_234_567,
        folderName: "Japan Trip"
    },
    {
        title: "Hotel Bookings",
        description: "Hotel confirmations",
        fileName: "hotels.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 876_543,
        folderName: "Japan Trip"
    },
    {
        title: "Europe Itinerary",
        description: "Summer Europe trip plan",
        fileName: "europe-trip.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        createdBy: "John Green",
        sizeBytes: 345_678,
        folderName: "Europe Trip"
    },
    {
        title: "Passport Scan",
        description: "Passport copy",
        fileName: "passport.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 2_345_678,
        folderName: "Travel"
    },

    // Root documents (no folder)
    {
        title: "Welcome to DMS",
        description: "Getting started guide",
        fileName: "welcome.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 123_456,
        folderName: null
    },
    {
        title: "2025_01_15_Director_Appointment_Resolution.pdf",
        description: "Director Appointment Resolution",
        fileName: "2025_01_15_Director_Appointment_Resolution.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 3_345_678,
        folderName: null
    },
    {
        title: "2024_12_10_Dividend_Declaration_Resolution.docx2024",
        description: "Dividend Declaration Resolution",
        fileName: "2024_12_10_Dividend_Declaration_Resolution.docx",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 4_345_678,
        folderName: null
    },
    {
        title: "2023_08_05_Investment_Policy_Approval.pdf",
        description: "Investment policy Approval",
        fileName: "2023_08_05_Investment_Policy_Approval.pdf",
        mimeType: "application/pdf",
        createdBy: "John Green",
        sizeBytes: 5_345_678,
        folderName: null
    }
];

// Define types for transaction client
type TransactionClient = Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;


async function createFolderHierarchy(tx: TransactionClient) {
    console.log(" Creating folders...");

    // First, create all root folders (parentId = null)
    const rootFolders = FOLDERS.filter(f => f.parentId === null);
    const createdFolders: Record<string, any> = {};

    for (const folder of rootFolders) {
        createdFolders[folder.name] = await tx.folder.create({
            data: {name: folder.name, createdBy: folder.createdBy}
        });
    }

    // Then create child folders that reference parents by name
    const childFolders = FOLDERS.filter((f): f is typeof f & { parentName: string } => 'parentName' in f);

    for (const folder of childFolders) {
        const parentFolder = createdFolders[folder.parentName];
        if (parentFolder) {
            createdFolders[folder.name] = await tx.folder.create({
                data: {
                    name: folder.name,
                    parentId: parentFolder.id
                }
            });
        } else {
            console.warn(`Parent folder "${folder.parentName}" not found for "${folder.name}"`);
        }
    }

    console.log(`Created ${Object.keys(createdFolders).length} folders`);
    return createdFolders;
}

async function createDocuments(tx: TransactionClient, folderMap: Record<string, any>) {
    console.log(" Creating documents...");

    const documents = DOCUMENTS.map(doc => {
        const obj = {
            title: doc.title,
            description: doc.description,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            createdBy: doc.createdBy,     // ← make sure this line exists
            sizeBytes: doc.sizeBytes,
            folderId: doc.folderName ? folderMap[doc.folderName]?.id : null,
        };
        console.log(`Preparing document: ${doc.title} | createdBy = "${obj.createdBy}"`);
        return obj;
    }).filter(doc => doc.folderId !== undefined || false);

    if (documents.length === 0) {
        console.log("No documents to create");
        return;
    }

    // Use createMany for better performance
    const result = await tx.document.createMany({
        data: documents,
        skipDuplicates: true,
    });

    console.log(`Created ${result.count} documents`);
    return result;
}

async function getStats(tx: TransactionClient) {
    const folderCount = await tx.folder.count();
    const documentCount = await tx.document.count();
    const rootFolders = await tx.folder.count({where: {parentId: null}});
    const documentsInFolders = await tx.document.count({where: {folderId: {not: null}}});
    const rootDocuments = await tx.document.count({where: {folderId: null}});

    return {
        folderCount,
        documentCount,
        rootFolders,
        documentsInFolders,
        rootDocuments,
    };
}

async function main() {
    console.log('...Seeding database...')
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is missing. Set it in the repo root .env.example or in apps/api/.env.example");
    }

    const db = getDatabaseConfigFromUrl(databaseUrl);

    const adapter = new PrismaMariaDb({
        host: db.host,
        port: db.port,
        user: db.user,
        password: db.password,
        database: db.database,
        connectionLimit: 5,
        allowPublicKeyRetrieval: true,
    });

    const prisma = new PrismaClient({adapter});

    try {
        console.log("Starting database seed...");
        console.log("==========================");

        // Use transaction for data consistency
        await prisma.$transaction(async (tx) => {
            // Clear existing data (in correct order due to foreign keys)
            await tx.document.deleteMany();
            await tx.folder.deleteMany();

            // Create folder hierarchy
            const folderMap = await createFolderHierarchy(tx);

            // Create documents
            await createDocuments(tx, folderMap);

            // Get and display stats
            const stats = await getStats(tx);

            console.log("==========================");
            console.log(" Seed Summary:");
            console.log(`   - Folders: ${stats.folderCount} (${stats.rootFolders} root folders)`);
            console.log(`   - Documents: ${stats.documentCount}`);
            console.log(`     • In folders: ${stats.documentsInFolders}`);
            console.log(`     • Root level: ${stats.rootDocuments}`);
        });

        console.log("==========================");
        console.log("✨ Seed completed successfully!");

    } catch (error) {
        console.error("❌ Seed failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Execute with error handling
main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
