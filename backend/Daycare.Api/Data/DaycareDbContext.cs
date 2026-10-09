using Daycare.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Data;
public class DaycareDbContext : DbContext
{
    public DaycareDbContext(DbContextOptions<DaycareDbContext> options) : base(options)
    {
    }

    public DbSet<Child> Children { get; set; } = null!;
    public DbSet<Parent> Parents { get; set; } = null!;
    public DbSet<ParentChild> ParentChildren { get; set; } = null!;
    public DbSet<Meal> Meals {get;set;} = null!;
    public DbSet<Staff> Staff {get;set;} = null!;
    public DbSet<ChildAttendance> ChildAttendances {get;set;}
    public DbSet<StaffAttendance> StaffAttendances {get;set;}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ParentChild>()
            .HasKey(pc => new { pc.ParentId, pc.ChildId });
        modelBuilder.Entity<ParentChild>()
            .HasOne(pc => pc.Parent)
            .WithMany(p => p.ParentChildren)
            .HasForeignKey(pc => pc.ParentId);
        modelBuilder.Entity<ParentChild>()
            .HasOne(pc => pc.Child)
            .WithMany(c => c.ParentChildren)
            .HasForeignKey(pc => pc.ChildId);
        modelBuilder.Entity<ChildAttendance>()
            .HasIndex(a => new { a.ChildId, a.AttendanceDate })
            .IsUnique();
        modelBuilder.Entity<StaffAttendance>()
            .HasIndex(a => new { a.StaffId, a.AttendanceDate })
            .IsUnique();
        base.OnModelCreating(modelBuilder);
    }
}