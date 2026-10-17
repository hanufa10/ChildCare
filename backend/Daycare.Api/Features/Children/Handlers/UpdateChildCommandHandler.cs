
using Daycare.Api.Data;
using Daycare.Api.Features.Children.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Daycare.Api.Features.Children.Handlers;

public class UpdateChildCommandHandler
    : IRequestHandler<UpdateChildCommand, UpdateChildResult>
{
    private readonly DaycareDbContext _context;

    public UpdateChildCommandHandler(DaycareDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateChildResult> Handle(
        UpdateChildCommand request,
        CancellationToken cancellationToken)
    {
        if (request.Id != request.Child.Id)
        {
            return new UpdateChildResult(
                false,
                Error: "Child ID does not match.");
        }

        var existingChild = await _context.Children
            .FirstOrDefaultAsync(
                c => c.Id == request.Id,
                cancellationToken);

        if (existingChild == null)
        {
            return new UpdateChildResult(false, NotFound: true);
        }

        if (!request.IsAdminOrStaff)
        {
            if (!request.IsParent || string.IsNullOrEmpty(request.UserId))
            {
                return new UpdateChildResult(false, Forbidden: true);
            }

            var parent = await _context.Parents
                .FirstOrDefaultAsync(
                    p => p.ApplicationUserId == request.UserId,
                    cancellationToken);

            if (parent == null)
            {
                return new UpdateChildResult(false, Forbidden: true);
            }

            var isLinked = await _context.ParentChildren
                .AnyAsync(
                    pc => pc.ParentId == parent.Id &&
                          pc.ChildId == request.Id,
                    cancellationToken);

            if (!isLinked)
            {
                return new UpdateChildResult(false, Forbidden: true);
            }
        }

        existingChild.FirstName = request.Child.FirstName;
        existingChild.LastName = request.Child.LastName;
        existingChild.DateOfBirth = request.Child.DateOfBirth;
        existingChild.Gender = request.Child.Gender;
        existingChild.Allergies = request.Child.Allergies;
        existingChild.HealthCondition = request.Child.HealthCondition;

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateChildResult(true);
    }
}
